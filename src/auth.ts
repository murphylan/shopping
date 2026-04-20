import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";

import { isAdminEmail } from "@/lib/admin";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";

/** Must match the key used to encrypt session cookies; see AUTH_SECRET in .env.local */
const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  trustHost: true,
  /** 无效/过期会话 cookie 会触发 JWTSessionError；库会清除 cookie，无需刷屏报错 */
  logger: {
    error(error) {
      const type =
        typeof error === "object" && error !== null && "type" in error
          ? String((error as { type: unknown }).type)
          : "";
      if (
        type === "JWTSessionError" ||
        (error instanceof Error && error.name === "JWTSessionError")
      ) {
        return;
      }
      console.error(error);
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        try {
          const [user] = await db
            .select({
              id: users.id,
              email: users.email,
              name: users.name,
              passwordHash: users.passwordHash,
            })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          if (!user?.passwordHash) return null;
          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name ?? "用户",
          };
        } catch (error) {
          console.error("Credentials authorize failed:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = isAdminEmail(session.user.email);
      }
      return session;
    },
  },
});
