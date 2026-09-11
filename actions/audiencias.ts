"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { obtenerAudiencia } from "@/lib/db/queries/audiencias";
import { obtenerExpediente } from "@/lib/db/queries/expedientes";
import { audiencias } from "@/lib/db/schema";
import { audienciaSchema } from "@/lib/validation/audiencias";

import { actionError, actionSuccess, type ActionResult } from "./types";

export async function crearAudiencia(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId();
  const parsed = audienciaSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  const expediente = await obtenerExpediente(userId, parsed.data.expedienteId);
  if (!expediente) return actionError("Expediente no encontrado");

  const [audiencia] = await db
    .insert(audiencias)
    .values({
      userId,
      expedienteId: parsed.data.expedienteId,
      fecha: parsed.data.fecha,
      hora: parsed.data.hora || null,
      tipo: parsed.data.tipo,
      lugar: parsed.data.lugar || null,
      observaciones: parsed.data.observaciones || null,
    })
    .returning({ id: audiencias.id });

  revalidatePath(`/expedientes/${parsed.data.expedienteId}`);
  revalidatePath("/calendario");

  return actionSuccess({ id: audiencia.id });
}

export async function actualizarAudiencia(id: string, input: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = audienciaSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  const existente = await obtenerAudiencia(userId, id);
  if (!existente) return actionError("Audiencia no encontrada");

  const expediente = await obtenerExpediente(userId, parsed.data.expedienteId);
  if (!expediente) return actionError("Expediente no encontrado");

  await db
    .update(audiencias)
    .set({
      fecha: parsed.data.fecha,
      hora: parsed.data.hora || null,
      tipo: parsed.data.tipo,
      lugar: parsed.data.lugar || null,
      observaciones: parsed.data.observaciones || null,
    })
    .where(and(eq(audiencias.id, id), eq(audiencias.userId, userId)));

  revalidatePath(`/expedientes/${parsed.data.expedienteId}`);
  revalidatePath("/calendario");

  return actionSuccess(undefined);
}

export async function eliminarAudiencia(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const existente = await obtenerAudiencia(userId, id);
  if (!existente) return actionError("Audiencia no encontrada");

  await db.delete(audiencias).where(and(eq(audiencias.id, id), eq(audiencias.userId, userId)));

  revalidatePath(`/expedientes/${existente.expedienteId}`);
  revalidatePath("/calendario");

  return actionSuccess(undefined);
}
