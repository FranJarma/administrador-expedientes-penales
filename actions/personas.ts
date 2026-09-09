"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { obtenerExpediente } from "@/lib/db/queries/expedientes";
import { obtenerPersona } from "@/lib/db/queries/personas";
import { personas } from "@/lib/db/schema";
import { personaSchema } from "@/lib/validation/personas";

import { actionError, actionSuccess, type ActionResult } from "./types";

export async function crearPersona(input: unknown): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId();
  const parsed = personaSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  const expediente = await obtenerExpediente(userId, parsed.data.expedienteId);
  if (!expediente) return actionError("Expediente no encontrado");

  const [persona] = await db
    .insert(personas)
    .values({
      userId,
      expedienteId: parsed.data.expedienteId,
      nombre: parsed.data.nombre,
      situacion: parsed.data.situacion,
      lugarDetencion: parsed.data.situacion === "Detenido"
        ? (parsed.data.lugarDetencion as (typeof personas.$inferInsert)["lugarDetencion"])
        : null,
      defensor: parsed.data.defensor || null,
      observaciones: parsed.data.observaciones || null,
    })
    .returning({ id: personas.id });

  revalidatePath(`/expedientes/${parsed.data.expedienteId}`);
  revalidatePath("/dashboard");
  revalidatePath("/calendario");

  return actionSuccess({ id: persona.id });
}

export async function actualizarPersona(id: string, input: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = personaSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  const existente = await obtenerPersona(userId, id);
  if (!existente) return actionError("Persona no encontrada");

  const expediente = await obtenerExpediente(userId, parsed.data.expedienteId);
  if (!expediente) return actionError("Expediente no encontrado");

  await db
    .update(personas)
    .set({
      nombre: parsed.data.nombre,
      situacion: parsed.data.situacion,
      lugarDetencion: parsed.data.situacion === "Detenido"
        ? (parsed.data.lugarDetencion as (typeof personas.$inferInsert)["lugarDetencion"])
        : null,
      defensor: parsed.data.defensor || null,
      observaciones: parsed.data.observaciones || null,
    })
    .where(and(eq(personas.id, id), eq(personas.userId, userId)));

  revalidatePath(`/expedientes/${parsed.data.expedienteId}`);
  revalidatePath("/dashboard");
  revalidatePath("/calendario");

  return actionSuccess(undefined);
}

export async function eliminarPersona(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const existente = await obtenerPersona(userId, id);
  if (!existente) return actionError("Persona no encontrada");

  await db.delete(personas).where(and(eq(personas.id, id), eq(personas.userId, userId)));

  revalidatePath(`/expedientes/${existente.expedienteId}`);
  revalidatePath("/dashboard");
  revalidatePath("/calendario");

  return actionSuccess(undefined);
}
