import { UserRole } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      phone?: string | null;
      avatarUrl?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    phone?: string | null;
    avatarUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    phone?: string | null;
    avatarUrl?: string | null;
  }
}
