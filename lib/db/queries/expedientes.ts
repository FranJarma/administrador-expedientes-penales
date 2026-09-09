import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { expedientes } from "@/lib/db/schema";

export async function listarExpedientes(userId: string) {
  return db
    .select()
    .from(expedientes)
    .where(eq(expedientes.userId, userId))
    .orderBy(desc(expedientes.actualizadoEn));
}

export async function obtenerExpediente(userId: string, id: string) {
  const [expediente] = await db
    .select()
    .from(expedientes)
    .where(and(eq(expedientes.userId, userId), eq(expedientes.id, id)))
    .limit(1);
  return expediente ?? null;
}
