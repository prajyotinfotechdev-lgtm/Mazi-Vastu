import webpush from 'web-push';
import { prisma } from '@/lib/db/prisma';

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY!;

// Initialize web-push if keys are present (prevents build crashes on Vercel/Railway)
if (publicVapidKey && privateVapidKey) {
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:admin@mazivastu.com',
      publicVapidKey,
      privateVapidKey
    );
  } catch (error) {
    console.warn('Failed to initialize web-push:', error);
  }
} else {
  console.warn('VAPID keys are missing. Push notifications will not be initialized.');
}

export async function sendPushNotificationToAllAdmins(payload: { title: string, body: string, url?: string }) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { adminId: { not: null } }
    });

    if (subscriptions.length === 0) return { success: true, message: 'No subscriptions found' };

    const payloadString = JSON.stringify(payload);
    await Promise.all(subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payloadString);
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Silently remove expired / unsubscribed
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        } else {
          console.error('Failed to send admin push notification:', err);
        }
      }
    }));

    return { success: true };
  } catch (err) {
    console.error('Error sending push notification to admins:', err);
    return { success: false, error: err };
  }
}

export async function sendPushNotificationToAllCustomers(payload: { title: string, body: string, url?: string }) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { adminId: null }
    });

    if (subscriptions.length === 0) return { success: true, message: 'No subscriptions found' };

    const payloadString = JSON.stringify(payload);
    await Promise.all(subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payloadString);
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Silently remove expired / unsubscribed
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        } else {
          console.error('Failed to send customer push notification:', err);
        }
      }
    }));

    return { success: true };
  } catch (err) {
    console.error('Error sending push notification to customers:', err);
    return { success: false, error: err };
  }
}
