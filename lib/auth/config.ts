import argon2 from "argon2";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { loginSchema } from "@/lib/validation/auth";

import {
  checkLoginRateLimit,
  registrarIntentoLogin,
  resetLoginRateLimit,
} from "./rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const limite = checkLoginRateLimit(email);
        if (!limite.permitido) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email.toLowerCase()))
          .limit(1);

        if (!user || !user.activo) {
          registrarIntentoLogin(email);
          return null;
        }

        const valido = await argon2.verify(user.passwordHash, password);
        if (!valido) {
          registrarIntentoLogin(email);
          return null;
        }

        resetLoginRateLimit(email);

        return {
          id: user.id,
          name: user.nombre,
          email: user.email,
          rol: user.rol,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.rol = (user as { rol: string }).rol;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.rol = token.rol as "admin" | "usuario";
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
