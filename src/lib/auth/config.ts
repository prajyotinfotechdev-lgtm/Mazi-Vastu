// ─── Auth.js Configuration ──────────────────────────────────────────────────
// Credentials provider for Admin authentication.
// JWT session strategy with bcrypt password verification.
// ──────────────────────────────────────────────────────────────────────────────

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logging/logger';

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          const admin = await prisma.admin.findUnique({
            where: { email: email.toLowerCase() },
          });

          if (!admin) {
            logger.warn('Admin login attempt with unknown email', {
              email: email.toLowerCase(),
            });
            return null;
          }

          if (!admin.isActive) {
            logger.warn('Inactive admin login attempt', {
              adminId: admin.id,
            });
            return null;
          }

          const isPasswordValid = await compare(password, admin.password);

          if (!isPasswordValid) {
            logger.warn('Admin login attempt with invalid password', {
              adminId: admin.id,
            });
            return null;
          }

          // Update last login timestamp
          await prisma.admin.update({
            where: { id: admin.id },
            data: { lastLoginAt: new Date() },
          });

          logger.info('Admin login successful', { adminId: admin.id });

          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
          };
        } catch (error) {
          logger.error('Admin authentication error', {
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
});
