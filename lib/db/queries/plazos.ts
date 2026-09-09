import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { expedientes, personas, plazos } from "@/lib/db/schema";

export type PlazoConDetalle = {
  plazo: typeof plazos.$inferSelect;
  expediente: typeof expedientes.$inferSelect;
  persona: typeof personas.$inferSelect | null;
};

export async function listarPlazosConDetalle(userId: string): Promise<PlazoConDetalle[]> {
  return db
    .select({ plazo: plazos, expediente: expedientes, persona: personas })
    .from(plazos)
    .innerJoin(expedientes, eq(plazos.expedienteId, expedientes.id))
    .leftJoin(personas, eq(plazos.personaId, personas.id))
    .where(eq(plazos.userId, userId));
}

export async function listarPlazosPorExpediente(userId: string, expedienteId: string) {
  return db
    .select({ plazo: plazos, persona: personas })
    .from(plazos)
    .leftJoin(personas, eq(plazos.personaId, personas.id))
    .where(and(eq(plazos.userId, userId), eq(plazos.expedienteId, expedienteId)));
}

export async function obtenerPlazo(userId: string, id: string) {
  const [plazo] = await db
    .select()
    .from(plazos)
    .where(and(eq(plazos.userId, userId), eq(plazos.id, id)))
    .limit(1);
  return plazo ?? null;
}
