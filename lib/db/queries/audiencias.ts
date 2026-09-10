import { and, asc, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { audiencias, expedientes } from "@/lib/db/schema";

export type AudienciaConDetalle = {
  audiencia: typeof audiencias.$inferSelect;
  expediente: typeof expedientes.$inferSelect;
};

export async function listarAudienciasConDetalle(
  userId: string
): Promise<AudienciaConDetalle[]> {
  return db
    .select({ audiencia: audiencias, expediente: expedientes })
    .from(audiencias)
    .innerJoin(expedientes, eq(audiencias.expedienteId, expedientes.id))
    .where(eq(audiencias.userId, userId));
}

export async function listarAudienciasPorExpediente(userId: string, expedienteId: string) {
  return db
    .select()
    .from(audiencias)
    .where(and(eq(audiencias.userId, userId), eq(audiencias.expedienteId, expedienteId)))
    .orderBy(asc(audiencias.fecha));
}

export async function obtenerAudiencia(userId: string, id: string) {
  const [audiencia] = await db
    .select()
    .from(audiencias)
    .where(and(eq(audiencias.userId, userId), eq(audiencias.id, id)))
    .limit(1);
  return audiencia ?? null;
}
