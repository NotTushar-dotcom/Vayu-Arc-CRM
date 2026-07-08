import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import bcrypt from "bcryptjs";

// Lazy-import prisma to avoid edge-runtime issues in middleware
async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          const prisma = await getPrisma();
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (user && user.password) {
            // Compare with bcrypt-hashed password from DB
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid) {
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
              };
            }
          }
        } catch {
          // DB not available — fall through to dev fallback
        }

        // Development fallback: hardcoded admin user for initial setup
        // Remove this block in production
        if (email === "admin@vayuarc.com" && password === "admin") {
          return {
            id: "1",
            name: "Admin User",
            email: "admin@vayuarc.com",
            role: "admin",
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith("/login");
      const isOnApi = nextUrl.pathname.startsWith("/api");

      if (!isLoggedIn && !isOnLogin && !isOnApi) {
        return false; // Redirects to login
      }
      if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL("/", nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
};
