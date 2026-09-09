import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      rol: "admin" | "usuario";
    } & DefaultSession["user"];
  }

  interface User {
    rol?: "admin" | "usuario";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    rol?: "admin" | "usuario";
  }
}
