import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { invitaciones, users } from "@/lib/db/schema";

export async function listarUsuarios() {
  return db.select().from(users).orderBy(desc(users.creadoEn));
}

export async function obtenerUsuarioPorEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return user ?? null;
}

export async function obtenerUsuarioPorId(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
}

export async function listarInvitaciones() {
  return db.select().from(invitaciones).orderBy(desc(invitaciones.creadoEn));
}

export async function obtenerInvitacionPorCodigo(codigo: string) {
  const [invitacion] = await db
    .select()
    .from(invitaciones)
    .where(eq(invitaciones.codigo, codigo))
    .limit(1);
  return invitacion ?? null;
}

export async function invitacionEstaDisponible(codigo: string) {
  const invitacion = await obtenerInvitacionPorCodigo(codigo);
  return !!invitacion && invitacion.usadoPor === null;
}
