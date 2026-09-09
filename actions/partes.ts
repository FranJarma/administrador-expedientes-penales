"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { obtenerExpediente } from "@/lib/db/queries/expedientes";
import { obtenerParte } from "@/lib/db/queries/partes";
import { partes } from "@/lib/db/schema";
import { parteSchema } from "@/lib/validation/partes";

import { actionError, actionSuccess, type ActionResult } from "./types";

export async function crearParte(input: unknown): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId();
  const parsed = parteSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  const expediente = await obtenerExpediente(userId, parsed.data.expedienteId);
  if (!expediente) return actionError("Expediente no encontrado");

  const [parte] = await db
    .insert(partes)
    .values({
      userId,
      expedienteId: parsed.data.expedienteId,
      rol: parsed.data.rol,
      nombre: parsed.data.nombre,
    })
    .returning({ id: partes.id });

  revalidatePath(`/expedientes/${parsed.data.expedienteId}`);

  return actionSuccess({ id: parte.id });
}

export async function actualizarParte(id: string, input: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = parteSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  const existente = await obtenerParte(userId, id);
  if (!existente) return actionError("Parte no encontrada");

  await db
    .update(partes)
    .set({ rol: parsed.data.rol, nombre: parsed.data.nombre })
    .where(and(eq(partes.id, id), eq(partes.userId, userId)));

  revalidatePath(`/expedientes/${parsed.data.expedienteId}`);

  return actionSuccess(undefined);
}

export async function eliminarParte(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const existente = await obtenerParte(userId, id);
  if (!existente) return actionError("Parte no encontrada");

  await db.delete(partes).where(and(eq(partes.id, id), eq(partes.userId, userId)));

  revalidatePath(`/expedientes/${existente.expedienteId}`);

  return actionSuccess(undefined);
}
