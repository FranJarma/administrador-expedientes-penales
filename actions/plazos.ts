"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth/session";
import {
  ajustarASiguienteHabil,
  feriadosASet,
  formatFechaSql,
  parseFechaSql,
} from "@/lib/business/dias-habiles";
import { db } from "@/lib/db/client";
import { obtenerExpediente } from "@/lib/db/queries/expedientes";
import { listarFeriados } from "@/lib/db/queries/feriados";
import { obtenerPersona } from "@/lib/db/queries/personas";
import { obtenerPlazo } from "@/lib/db/queries/plazos";
import { plazos } from "@/lib/db/schema";
import { marcarCumplidoSchema, plazoSchema } from "@/lib/validation/plazos";

import { actionError, actionSuccess, type ActionResult } from "./types";

async function ajustarFechaVencimiento(userId: string, fecha: string) {
  const feriados = await listarFeriados(userId);
  const feriadosSet = feriadosASet(feriados);
  const ajustada = ajustarASiguienteHabil(parseFechaSql(fecha), feriadosSet);
  const fechaAjustada = formatFechaSql(ajustada);
  return { fechaAjustada, seAjusto: fechaAjustada !== fecha };
}

export async function crearPlazo(
  input: unknown
): Promise<ActionResult<{ id: string; fechaAjustada: string; seAjusto: boolean }>> {
  const userId = await requireUserId();
  const parsed = plazoSchema.safeParse(input);
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

  const { fechaAjustada, seAjusto } = await ajustarFechaVencimiento(
    userId,
    parsed.data.fechaVencimiento
  );

  const [plazo] = await db
    .insert(plazos)
    .values({
      userId,
      expedienteId: parsed.data.expedienteId,
      categoria: parsed.data.categoria,
      personaId: parsed.data.personaId || null,
      tipo: parsed.data.tipo,
      descripcion: parsed.data.descripcion || null,
      fechaInicio: parsed.data.fechaInicio,
      fechaVencimiento: fechaAjustada,
      responsable: parsed.data.responsable,
      observaciones: parsed.data.observaciones || null,
    })
    .returning({ id: plazos.id });

  revalidatePath(`/expedientes/${parsed.data.expedienteId}`);
  revalidatePath("/plazos");
  revalidatePath("/dashboard");
  revalidatePath("/calendario");
  revalidatePath("/carga-de-trabajo");

  return actionSuccess({ id: plazo.id, fechaAjustada, seAjusto });
}

export async function actualizarPlazo(
  id: string,
  input: unknown
): Promise<ActionResult<{ fechaAjustada: string; seAjusto: boolean }>> {
  const userId = await requireUserId();
  const parsed = plazoSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  const existente = await obtenerPlazo(userId, id);
  if (!existente) return actionError("Plazo no encontrado");

  const expediente = await obtenerExpediente(userId, parsed.data.expedienteId);
  if (!expediente) return actionError("Expediente no encontrado");

  if (parsed.data.personaId) {
    const persona = await obtenerPersona(userId, parsed.data.personaId);
    if (!persona || persona.expedienteId !== parsed.data.expedienteId) {
      return actionError("Persona no encontrada en este expediente");
    }
  }

  const { fechaAjustada, seAjusto } = await ajustarFechaVencimiento(
    userId,
    parsed.data.fechaVencimiento
  );

  await db
    .update(plazos)
    .set({
      categoria: parsed.data.categoria,
      personaId: parsed.data.personaId || null,
      tipo: parsed.data.tipo,
      descripcion: parsed.data.descripcion || null,
      fechaInicio: parsed.data.fechaInicio,
      fechaVencimiento: fechaAjustada,
      responsable: parsed.data.responsable,
      observaciones: parsed.data.observaciones || null,
    })
    .where(and(eq(plazos.id, id), eq(plazos.userId, userId)));

  revalidatePath(`/expedientes/${parsed.data.expedienteId}`);
  revalidatePath("/plazos");
  revalidatePath("/dashboard");
  revalidatePath("/calendario");
  revalidatePath("/carga-de-trabajo");

  return actionSuccess({ fechaAjustada, seAjusto });
}

export async function marcarCumplido(input: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = marcarCumplidoSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  const existente = await obtenerPlazo(userId, parsed.data.id);
  if (!existente) return actionError("Plazo no encontrado");

  await db
    .update(plazos)
    .set({
      cumplido: parsed.data.cumplido,
      cumplidoEn: parsed.data.cumplido ? new Date() : null,
    })
    .where(and(eq(plazos.id, parsed.data.id), eq(plazos.userId, userId)));

  revalidatePath(`/expedientes/${existente.expedienteId}`);
  revalidatePath("/plazos");
  revalidatePath("/dashboard");
  revalidatePath("/calendario");
  revalidatePath("/carga-de-trabajo");

  return actionSuccess(undefined);
}

export async function eliminarPlazo(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const existente = await obtenerPlazo(userId, id);
  if (!existente) return actionError("Plazo no encontrado");

  await db.delete(plazos).where(and(eq(plazos.id, id), eq(plazos.userId, userId)));

  revalidatePath(`/expedientes/${existente.expedienteId}`);
  revalidatePath("/plazos");
  revalidatePath("/dashboard");
  revalidatePath("/calendario");
  revalidatePath("/carga-de-trabajo");

  return actionSuccess(undefined);
}
