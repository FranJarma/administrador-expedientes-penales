import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { expedientes, personas, tareas } from "@/lib/db/schema";

export type TareaConDetalle = {
  tarea: typeof tareas.$inferSelect;
  expediente: typeof expedientes.$inferSelect;
  persona: typeof personas.$inferSelect | null;
};

export async function listarTareasConDetalle(userId: string): Promise<TareaConDetalle[]> {
  return db
    .select({ tarea: tareas, expediente: expedientes, persona: personas })
    .from(tareas)
    .innerJoin(expedientes, eq(tareas.expedienteId, expedientes.id))
    .leftJoin(personas, eq(tareas.personaId, personas.id))
    .where(eq(tareas.userId, userId));
}

export async function listarTareasPorExpediente(userId: string, expedienteId: string) {
  return db
    .select({ tarea: tareas, persona: personas })
    .from(tareas)
    .leftJoin(personas, eq(tareas.personaId, personas.id))
    .where(and(eq(tareas.userId, userId), eq(tareas.expedienteId, expedienteId)));
}

export async function obtenerTarea(userId: string, id: string) {
  const [tarea] = await db
    .select()
    .from(tareas)
    .where(and(eq(tareas.userId, userId), eq(tareas.id, id)))
    .limit(1);
  return tarea ?? null;
}
