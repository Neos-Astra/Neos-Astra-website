import NextAuth, { type DefaultSession } from "next-auth";
import "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
if (!authSecret && process.env.NODE_ENV === "production") {
  console.warn("⚠️ [SECURITY WARNING]: AUTH_SECRET or NEXTAUTH_SECRET is not set in environment variables.");
}

process.env.AUTH_TRUST_HOST = "true";

export type AdminRole = "SUPER_ADMIN" | "ADMIN";

declare module "next-auth" {
  interface User {
    id?: string;
    role: AdminRole;
    canManageAdmins: boolean;
    canDeleteUsers: boolean;
    canEditCourses: boolean;
    canManageEvents: boolean;
    canManageContent: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: AdminRole;
      canManageAdmins: boolean;
      canDeleteUsers: boolean;
      canEditCourses: boolean;
      canManageEvents: boolean;
      canManageContent: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: AdminRole;
    canManageAdmins?: boolean;
    canDeleteUsers?: boolean;
    canEditCourses?: boolean;
    canManageEvents?: boolean;
    canManageContent?: boolean;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: authSecret || (process.env.NODE_ENV !== "production" ? "local-development-secret-key-neos-astra" : undefined),
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours — persists across browser restarts
  },
  pages: {
    signIn: "/superadmin/login",
  },
  providers: [
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        const { prisma } = await import("@/superadmin/prisma/client");
        const bcrypt = await import("bcryptjs");
        const compareFn = bcrypt.compare || (bcrypt as any).default?.compare;

        let user;
        try {
          user = await prisma.adminUser.findUnique({
            where: { email },
          });
        } catch (dbErr: any) {
          console.error("Database connection error in NextAuth authorize:", dbErr);
          throw new Error("Database connection failed. Please check Vercel DATABASE_URL.");
        }

        if (!user) {
          throw new Error("No account found with this email.");
        }

        if (!user.isActive) {
          throw new Error("Account is inactive.");
        }

        if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
          const timeRemaining = Math.ceil(
            (new Date(user.lockedUntil).getTime() - Date.now()) / (1000 * 60)
          );
          throw new Error(
            `Account is locked due to multiple failed login attempts. Try again in ${timeRemaining} minute(s).`
          );
        }

        const isValidPassword = await compareFn(password, user.passwordHash);

        if (!isValidPassword) {
          const newFailedCount = user.failedLoginCount + 1;
          let lockedUntil: Date | null = null;

          if (newFailedCount >= 5) {
            lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lock
          }

          await prisma.adminUser.update({
            where: { id: user.id },
            data: {
              failedLoginCount: newFailedCount,
              lockedUntil: lockedUntil ?? user.lockedUntil,
            },
          });

          if (newFailedCount >= 5) {
            throw new Error(
              "Account locked due to 5 failed login attempts. Try again in 15 minutes."
            );
          }

          throw new Error("Invalid credentials.");
        }

        // Reset failed login counters and update last login timestamp
        await prisma.adminUser.update({
          where: { id: user.id },
          data: {
            failedLoginCount: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        });

        // Create audit log entry
        await prisma.auditLog.create({
          data: {
            action: "LOGIN_SUCCESS",
            adminUserId: user.id,
            details: `Admin user ${user.email} logged in successfully`,
          },
        });

        const isSuperAdmin = user.role === "SUPER_ADMIN";

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          canManageAdmins: isSuperAdmin ? true : user.canManageAdmins,
          canDeleteUsers: isSuperAdmin ? true : user.canDeleteUsers,
          canEditCourses: isSuperAdmin ? true : user.canEditCourses,
          canManageEvents: isSuperAdmin ? true : user.canManageEvents,
          canManageContent: isSuperAdmin ? true : user.canManageContent,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        const isSuperAdmin = user.role === "SUPER_ADMIN";
        token.canManageAdmins = isSuperAdmin ? true : user.canManageAdmins;
        token.canDeleteUsers = isSuperAdmin ? true : user.canDeleteUsers;
        token.canEditCourses = isSuperAdmin ? true : user.canEditCourses;
        token.canManageEvents = isSuperAdmin ? true : user.canManageEvents;
        token.canManageContent = isSuperAdmin ? true : user.canManageContent;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as AdminRole;
        const isSuperAdmin = token.role === "SUPER_ADMIN";
        session.user.canManageAdmins = isSuperAdmin ? true : (token.canManageAdmins as boolean);
        session.user.canDeleteUsers = isSuperAdmin ? true : (token.canDeleteUsers as boolean);
        session.user.canEditCourses = isSuperAdmin ? true : (token.canEditCourses as boolean);
        session.user.canManageEvents = isSuperAdmin ? true : (token.canManageEvents as boolean);
        session.user.canManageContent = isSuperAdmin ? true : (token.canManageContent as boolean);
      }
      return session;
    },
  },
});
