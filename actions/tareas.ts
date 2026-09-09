"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { obtenerExpediente } from "@/lib/db/queries/expedientes";
import { obtenerPersona } from "@/lib/db/queries/personas";
import { obtenerTarea } from "@/lib/db/queries/tareas";
import { tareas } from "@/lib/db/schema";
import { tareaSchema } from "@/lib/validation/tareas";

import { actionError, actionSuccess, type ActionResult } from "./types";

export async function crearTarea(input: unknown): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId();
  const parsed = tareaSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  const expediente = await obtenerExpediente(userId, parsed.data.expedienteId);
  if (!expediente) return actionError("Expediente no encontrado");

  if (parsed.data.personaId) {
    const persona = await obtenerPersona(userId, parsed.data.personaId);
    if (!persona || persona.expedienteId !== parsed.data.expedienteId) {
      return actionError("Persona no encontrada en este expediente");
    }
  }

  const [tarea] = await db
    .insert(tareas)
    .values({
      userId,
      expedienteId: parsed.data.expedienteId,
      personaId: parsed.data.personaId || null,
      titulo: parsed.data.titulo,
      descripcion: parsed.data.descripcion || null,
      responsable: parsed.data.responsable,
      fechaLimite: parsed.data.fechaLimite,
      estado: parsed.data.estado,
    })
    .returning({ id: tareas.id });

  revalidatePath(`/expedientes/${parsed.data.expedienteId}`);
  revalidatePath("/tareas");
  revalidatePath("/dashboard");
  revalidatePath("/carga-de-trabajo");

  return actionSuccess({ id: tarea.id });
}

export async function actualizarTarea(id: string, input: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = tareaSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  const existente = await obtenerTarea(userId, id);
  if (!existente) return actionError("Tarea no encontrada");

  if (parsed.data.personaId) {
    const persona = await obtenerPersona(userId, parsed.data.personaId);
    if (!persona || persona.expedienteId !== parsed.data.expedienteId) {
      return actionError("Persona no encontrada en este expediente");
    }
  }

  await db
    .update(tareas)
    .set({
      personaId: parsed.data.personaId || null,
      titulo: parsed.data.titulo,
      descripcion: parsed.data.descripcion || null,
      responsable: parsed.data.responsable,
      fechaLimite: parsed.data.fechaLimite,
      estado: parsed.data.estado,
    })
    .where(and(eq(tareas.id, id), eq(tareas.userId, userId)));

  revalidatePath(`/expedientes/${parsed.data.expedienteId}`);
  revalidatePath("/tareas");
  revalidatePath("/dashboard");
  revalidatePath("/carga-de-trabajo");

  return actionSuccess(undefined);
}

export async function cambiarEstadoTarea(id: string, estado: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const existente = await obtenerTarea(userId, id);
  if (!existente) return actionError("Tarea no encontrada");

  const parsedEstado = tareaSchema.shape.estado.safeParse(estado);
  if (!parsedEstado.success) return actionError("Estado inválido");

  await db
    .update(tareas)
    .set({ estado: parsedEstado.data })
    .where(and(eq(tareas.id, id), eq(tareas.userId, userId)));

  revalidatePath(`/expedientes/${existente.expedienteId}`);
  revalidatePath("/tareas");
  revalidatePath("/dashboard");
  revalidatePath("/carga-de-trabajo");

  return actionSuccess(undefined);
}

export async function eliminarTarea(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const existente = await obtenerTarea(userId, id);
  if (!existente) return actionError("Tarea no encontrada");

  await db.delete(tareas).where(and(eq(tareas.id, id), eq(tareas.userId, userId)));

  revalidatePath(`/expedientes/${existente.expedienteId}`);
  revalidatePath("/tareas");
  revalidatePath("/dashboard");
  revalidatePath("/carga-de-trabajo");

  return actionSuccess(undefined);
}
