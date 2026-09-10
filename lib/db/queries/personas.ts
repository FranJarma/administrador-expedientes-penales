import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { personas } from "@/lib/db/schema";

export async function listarPersonasPorExpediente(userId: string, expedienteId: string) {
  return db
    .select()
    .from(personas)
    .where(and(eq(personas.userId, userId), eq(personas.expedienteId, expedienteId)));
}

export async function obtenerPersona(userId: string, id: string) {
  const [persona] = await db
    .select()
    .from(personas)
    .where(and(eq(personas.userId, userId), eq(personas.id, id)))
    .limit(1);
  return persona ?? null;
}

export async function obtenerExpedientesConDetenidos(userId: string): Promise<Set<string>> {
  const rows = await db
    .selectDistinct({ expedienteId: personas.expedienteId })
    .from(personas)
    .where(and(eq(personas.userId, userId), eq(personas.situacion, "Detenido")));
  return new Set(rows.map((r) => r.expedienteId));
}

