import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { partes } from "@/lib/db/schema";

export async function listarPartesPorExpediente(userId: string, expedienteId: string) {
  return db
    .select()
    .from(partes)
    .where(and(eq(partes.userId, userId), eq(partes.expedienteId, expedienteId)));
}

export async function obtenerParte(userId: string, id: string) {
  const [parte] = await db
    .select()
    .from(partes)
    .where(and(eq(partes.userId, userId), eq(partes.id, id)))
    .limit(1);
  return parte ?? null;
}
