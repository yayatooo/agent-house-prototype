import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config.
 * Must NOT import any Node.js-only modules (pg, bcrypt, etc.).
 * Used by middleware for route authorization checks.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
