import type { Adapter, AdapterUser } from 'next-auth/adapters';
import { and, eq } from 'drizzle-orm';
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

import { db } from '@/lib/db';
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from '@/lib/db/schema';

// ---------------------------------------------------------------------------
// Custom adapter – our `users` table has `displayName` + required `username`
// instead of the standard Auth.js `name` column, so we can't use the stock
// DrizzleAdapter directly. We only implement the subset of methods that
// Auth.js needs for the Google-OAuth + JWT-session flow.
// ---------------------------------------------------------------------------

function customAdapter(): Adapter {
  return {
    // ---- Users ----------------------------------------------------------
    async createUser(data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const name = (data as any).name as string | undefined;
      const email = data.email ?? '';
      const displayName = name || email.split('@')[0] || 'User';
      const baseUsername = email
        .split('@')[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      const username =
        baseUsername + '_' + Math.random().toString(36).slice(2, 8);

      const [row] = await db
        .insert(users)
        .values({
          email: data.email,
          emailVerified: data.emailVerified ?? null,
          image: data.image ?? null,
          displayName,
          username,
        })
        .returning();

      return toAdapterUser(row);
    },

    async getUser(id) {
      const [row] = await db.select().from(users).where(eq(users.id, id));
      return row ? toAdapterUser(row) : null;
    },

    async getUserByEmail(email) {
      const [row] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      return row ? toAdapterUser(row) : null;
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const [result] = await db
        .select({ user: users })
        .from(accounts)
        .innerJoin(users, eq(accounts.userId, users.id))
        .where(
          and(
            eq(accounts.provider, provider),
            eq(accounts.providerAccountId, providerAccountId),
          ),
        );
      return result ? toAdapterUser(result.user) : null;
    },

    async updateUser(data) {
      if (!data.id) throw new Error('No user id.');
      // Map Auth.js `name` → our `displayName`
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped: Record<string, unknown> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((data as any).name !== undefined)
        mapped.displayName = (data as any).name;
      if (data.email !== undefined) mapped.email = data.email;
      if (data.emailVerified !== undefined)
        mapped.emailVerified = data.emailVerified;
      if (data.image !== undefined) mapped.image = data.image;

      const [row] = await db
        .update(users)
        .set(mapped)
        .where(eq(users.id, data.id))
        .returning();
      if (!row) throw new Error('User not found.');
      return toAdapterUser(row);
    },

    async deleteUser(id) {
      await db.delete(users).where(eq(users.id, id));
    },

    // ---- Accounts -------------------------------------------------------
    async linkAccount(data) {
      await db.insert(accounts).values({
        userId: data.userId,
        type: data.type,
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        refreshToken: (data.refresh_token as string) ?? null,
        accessToken: (data.access_token as string) ?? null,
        expiresAt: (data.expires_at as number) ?? null,
        tokenType: (data.token_type as string) ?? null,
        scope: (data.scope as string) ?? null,
        idToken: (data.id_token as string) ?? null,
        sessionState: (data.session_state as string) ?? null,
      });
    },

    async unlinkAccount({ provider, providerAccountId }) {
      await db
        .delete(accounts)
        .where(
          and(
            eq(accounts.provider, provider),
            eq(accounts.providerAccountId, providerAccountId),
          ),
        );
    },

    // ---- Sessions (needed for adapter contract even with JWT strategy) --
    async createSession(data) {
      const [row] = await db.insert(sessions).values(data).returning();
      return row;
    },

    async getSessionAndUser(sessionToken) {
      const [result] = await db
        .select({ session: sessions, user: users })
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(eq(sessions.sessionToken, sessionToken));
      if (!result) return null;
      return {
        session: result.session,
        user: toAdapterUser(result.user),
      };
    },

    async updateSession(data) {
      const [row] = await db
        .update(sessions)
        .set(data)
        .where(eq(sessions.sessionToken, data.sessionToken))
        .returning();
      return row ?? null;
    },

    async deleteSession(sessionToken) {
      await db
        .delete(sessions)
        .where(eq(sessions.sessionToken, sessionToken));
    },

    // ---- Verification tokens --------------------------------------------
    async createVerificationToken(data) {
      const [row] = await db
        .insert(verificationTokens)
        .values(data)
        .returning();
      return row;
    },

    async useVerificationToken({ identifier, token }) {
      const [row] = await db
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, identifier),
            eq(verificationTokens.token, token),
          ),
        )
        .returning();
      return row ?? null;
    },
  };
}

/** Map a DB user row to the shape Auth.js expects. */
function toAdapterUser(
  row: typeof users.$inferSelect,
): AdapterUser {
  return {
    id: row.id,
    name: row.displayName,
    email: row.email ?? '',
    emailVerified: row.emailVerified ?? null,
    image: row.image ?? null,
  };
}

// ---------------------------------------------------------------------------
// NextAuth configuration
// ---------------------------------------------------------------------------

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: customAdapter(),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/sign-in',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}
