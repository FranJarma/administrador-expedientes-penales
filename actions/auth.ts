"use server";

import { randomBytes } from "crypto";

import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";

import { signIn, signOut } from "@/lib/auth/config";
import { requireAdmin } from "@/lib/auth/session";
import { ANTICIPACIONES_DEFAULT } from "@/lib/constants";
import { db } from "@/lib/db/client";
import { configuracionNotificaciones, feriados, invitaciones, users } from "@/lib/db/schema";
import { FERIADOS_2026 } from "@/lib/data/feriados-2026";
import {
  crearInvitacionSchema,
  loginSchema,
  registroSchema,
} from "@/lib/validation/auth";

import { actionError, actionSuccess, type ActionResult } from "./types";

export async function loginAction(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return actionError("Email o contraseña incorrectos");
    }
    throw error;
  }

  return actionSuccess(undefined);
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function registroAction(input: unknown): Promise<ActionResult> {
  const parsed = registroSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  const { nombre, email, password, codigoInvitacion } = parsed.data;
  const emailNormalizado = email.toLowerCase();

  const [invitacion] = await db
    .select()
    .from(invitaciones)
    .where(eq(invitaciones.codigo, codigoInvitacion))
    .limit(1);

  if (!invitacion || invitacion.usadoPor) {
    return actionError("Código de invitación inválido o ya utilizado", {
      codigoInvitacion: ["Código de invitación inválido o ya utilizado"],
    });
  }

  const [existente] = await db
    .select()
    .from(users)
    .where(eq(users.email, emailNormalizado))
    .limit(1);

  if (existente) {
    return actionError("Ya existe un usuario con ese email", {
      email: ["Ya existe un usuario con ese email"],
    });
  }

  const passwordHash = await argon2.hash(password);

  const [user] = await db
    .insert(users)
    .values({ nombre, email: emailNormalizado, passwordHash, rol: "usuario" })
    .returning({ id: users.id });

  await db
    .update(invitaciones)
    .set({ usadoPor: user.id, usadoEn: new Date() })
    .where(eq(invitaciones.id, invitacion.id));

  await db.insert(configuracionNotificaciones).values({
    userId: user.id,
    anticipaciones: ANTICIPACIONES_DEFAULT,
  });

  await db.insert(feriados).values(
    FERIADOS_2026.map((f) => ({ userId: user.id, fecha: f.fecha, nombre: f.nombre }))
  );

  return actionSuccess(undefined);
}

export async function crearInvitaciones(
  input: unknown
): Promise<ActionResult<{ codigos: string[] }>> {
  const adminId = await requireAdmin();
  const parsed = crearInvitacionSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  const codigos = Array.from({ length: parsed.data.cantidad }, () =>
    randomBytes(5).toString("hex")
  );

  await db
    .insert(invitaciones)
    .values(codigos.map((codigo) => ({ codigo, creadoPor: adminId })));

  revalidatePath("/admin");

  return actionSuccess({ codigos });
}

export async function revocarUsuario(id: string): Promise<ActionResult> {
  await requireAdmin();

  await db.update(users).set({ activo: false }).where(eq(users.id, id));

  revalidatePath("/admin");

  return actionSuccess(undefined);
}

export async function reactivarUsuario(id: string): Promise<ActionResult> {
  await requireAdmin();

  await db.update(users).set({ activo: true }).where(eq(users.id, id));

  revalidatePath("/admin");

  return actionSuccess(undefined);
}
