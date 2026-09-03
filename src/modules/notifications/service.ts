// ─── Notification Service ───────────────────────────────────────────────────
// Web Push with VAPID + PostgreSQL-backed outbox for notifications.
// Push failure NEVER rolls back property publication.
// ──────────────────────────────────────────────────────────────────────────────

import { prisma } from '@/lib/db/prisma';
import { ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logging/logger';
import webPush from 'web-push';
import { z } from 'zod';
import type { PushSubscription as PushSub, NotificationOutbox } from '@prisma/client';

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url('Invalid push endpoint'),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  visitorId: z.string().optional(),
  userAgent: z.string().optional(),
});

export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;

// ─── VAPID Configuration ────────────────────────────────────────────────────

let vapidConfigured = false;

function ensureVapidConfigured(): void {
  if (vapidConfigured) return;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    throw new Error('VAPID keys are not configured');
  }

  webPush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
}

// ─── Push Subscription Management ───────────────────────────────────────────

export class NotificationService {
  /**
   * Subscribes a device for push notifications.
   * Handles duplicate endpoints gracefully.
   */
  static async subscribe(input: PushSubscriptionInput): Promise<PushSub> {
    // Check for existing subscription with same endpoint
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint: input.endpoint },
    });

    if (existing) {
      // Update keys and reactivate if needed
      return prisma.pushSubscription.update({
        where: { id: existing.id },
        data: {
          p256dh: input.keys.p256dh,
          auth: input.keys.auth,
          isActive: true,
          visitorId: input.visitorId || existing.visitorId,
          userAgent: input.userAgent || existing.userAgent,
        },
      });
    }

    return prisma.pushSubscription.create({
      data: {
        endpoint: input.endpoint,
        p256dh: input.keys.p256dh,
        auth: input.keys.auth,
        visitorId: input.visitorId,
        userAgent: input.userAgent,
        isActive: true,
      },
    });
  }

  /**
   * Unsubscribes a device from push notifications.
   */
  static async unsubscribe(endpoint: string): Promise<void> {
    const subscription = await prisma.pushSubscription.findUnique({
      where: { endpoint },
    });

    if (subscription) {
      await prisma.pushSubscription.update({
        where: { id: subscription.id },
        data: { isActive: false },
      });
    }
  }

  /**
   * Processes pending notifications from the outbox.
   * Called in-process (no separate worker needed for MVP).
   */
  static async processOutbox(): Promise<void> {
    ensureVapidConfigured();

    const pendingJobs = await prisma.notificationOutbox.findMany({
      where: {
        status: 'PENDING',
        attempts: { lt: prisma.notificationOutbox.fields.maxAttempts ? undefined : 3 },
      },
      orderBy: { createdAt: 'asc' },
      take: 10, // Process in small batches
    });

    for (const job of pendingJobs) {
      await this.processJob(job);
    }
  }

  /**
   * Processes a single notification job.
   */
  private static async processJob(job: NotificationOutbox): Promise<void> {
    try {
      // Mark as processing
      await prisma.notificationOutbox.update({
        where: { id: job.id },
        data: {
          status: 'PROCESSING',
          attempts: { increment: 1 },
          lastAttemptAt: new Date(),
        },
      });

      // Determine target audience based on job type
      const targetWhere: any = { isActive: true };
      
      if (job.type === 'NEW_PROPERTY') {
        // Properties are for visitors/customers (no adminId)
        targetWhere.adminId = null;
      } else if (job.type === 'NEW_LEAD') {
        // Leads are for admins
        targetWhere.adminId = { not: null };
      }

      // Get active subscriptions
      const subscriptions = await prisma.pushSubscription.findMany({
        where: targetWhere,
      });

      const payload = JSON.stringify(job.payload);
      let successCount = 0;
      let failureCount = 0;

      // Send to all subscriptions
      for (const sub of subscriptions) {
        try {
          await webPush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payload
          );

          successCount++;

          // Update last success
          await prisma.pushSubscription.update({
            where: { id: sub.id },
            data: { lastSuccessAt: new Date() },
          });
        } catch (error) {
          failureCount++;

          const statusCode =
            error && typeof error === 'object' && 'statusCode' in error
              ? (error as { statusCode: number }).statusCode
              : 0;

          // Deactivate on permanent failure (410 Gone, 404 Not Found)
          if (statusCode === 410 || statusCode === 404) {
            await prisma.pushSubscription.update({
              where: { id: sub.id },
              data: {
                isActive: false,
                lastFailureAt: new Date(),
              },
            });

            logger.info('Push subscription deactivated (gone)', {
              subscriptionId: sub.id,
            });
          } else {
            await prisma.pushSubscription.update({
              where: { id: sub.id },
              data: { lastFailureAt: new Date() },
            });
          }
        }
      }

      // Mark job as completed
      await prisma.notificationOutbox.update({
        where: { id: job.id },
        data: {
          status: 'SENT',
          processedAt: new Date(),
        },
      });

      logger.info('Notification processed', {
        jobId: job.id,
        successCount,
        failureCount,
        totalSubscriptions: subscriptions.length,
      });
    } catch (error) {
      // Mark as failed for retry
      const attempts = job.attempts + 1;
      await prisma.notificationOutbox.update({
        where: { id: job.id },
        data: {
          status: attempts >= (job.maxAttempts || 3) ? 'FAILED' : 'PENDING',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      logger.error('Notification processing failed', {
        jobId: job.id,
        attempts,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Manually triggers outbox processing.
   * Used by admin or after property publish.
   */
  static async triggerProcessing(): Promise<{ processed: number }> {
    const pending = await prisma.notificationOutbox.count({
      where: { status: 'PENDING' },
    });

    if (pending > 0) {
      // Process asynchronously (don't block the response)
      this.processOutbox().catch((err) => {
        logger.error('Background notification processing failed', {
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      });
    }

    return { processed: pending };
  }
}
