"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { obtenerExpediente } from "@/lib/db/queries/expedientes";
import { expedientes } from "@/lib/db/schema";
import { expedienteSchema } from "@/lib/validation/expedientes";

import { actionError, actionSuccess, type ActionResult } from "./types";

export async function crearExpediente(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId();
  const parsed = expedienteSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  const [expediente] = await db
    .insert(expedientes)
    .values({
      userId,
      numero: parsed.data.numero,
      caratula: parsed.data.caratula,
      fuero: parsed.data.fuero,
      estado: parsed.data.estado,
      responsable: parsed.data.responsable,
      fechaInicio: parsed.data.fechaInicio,
      observaciones: parsed.data.observaciones || null,
    })
    .returning({ id: expedientes.id });

  revalidatePath("/expedientes");
  revalidatePath("/dashboard");
  revalidatePath("/carga-de-trabajo");

  return actionSuccess({ id: expediente.id });
}

export async function actualizarExpediente(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = expedienteSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  const existente = await obtenerExpediente(userId, id);
  if (!existente) return actionError("Expediente no encontrado");

  await db
    .update(expedientes)
    .set({
      numero: parsed.data.numero,
      caratula: parsed.data.caratula,
      fuero: parsed.data.fuero,
      estado: parsed.data.estado,
      responsable: parsed.data.responsable,
      fechaInicio: parsed.data.fechaInicio,
      observaciones: parsed.data.observaciones || null,
    })
    .where(and(eq(expedientes.id, id), eq(expedientes.userId, userId)));

  revalidatePath(`/expedientes/${id}`);
  revalidatePath("/expedientes");
  revalidatePath("/dashboard");
  revalidatePath("/carga-de-trabajo");

  return actionSuccess(undefined);
}

export async function eliminarExpediente(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const existente = await obtenerExpediente(userId, id);
  if (!existente) return actionError("Expediente no encontrado");

  await db
    .delete(expedientes)
    .where(and(eq(expedientes.id, id), eq(expedientes.userId, userId)));

  revalidatePath("/expedientes");
  revalidatePath("/dashboard");

  return actionSuccess(undefined);
}
