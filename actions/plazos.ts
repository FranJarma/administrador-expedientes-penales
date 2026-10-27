"use server";

import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth/session";
import {
  ajustarASiguienteHabil,
  diasHabilesRestantesAlSuspender,
  feriadosASet,
  formatFechaSql,
  parseFechaSql,
  sumarDiasHabiles,
  vencimientoAlReanudar,
} from "@/lib/business/dias-habiles";
import { DIAS_AMPLIACION_PLAZO } from "@/lib/constants";
import { db } from "@/lib/db/client";
import { obtenerExpediente } from "@/lib/db/queries/expedientes";
import { listarFeriados } from "@/lib/db/queries/feriados";
import { obtenerPersona } from "@/lib/db/queries/personas";
import { obtenerPlazo } from "@/lib/db/queries/plazos";
import { plazos } from "@/lib/db/schema";
import {
  ampliarPlazoSchema,
  marcarCumplidoSchema,
  plazoSchema,
  reanudarPlazoSchema,
  suspenderPlazoSchema,
} from "@/lib/validation/plazos";

import { actionError, actionSuccess, type ActionResult } from "./types";

function revalidarPlazos(expedienteId: string) {
  revalidatePath(`/expedientes/${expedienteId}`);
  revalidatePath("/plazos");
  revalidatePath("/dashboard");
  revalidatePath("/calendario");
  revalidatePath("/carga-de-trabajo");
  revalidatePath("/notificaciones");
}

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

  revalidarPlazos(parsed.data.expedienteId);

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

  revalidarPlazos(parsed.data.expedienteId);

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

  revalidarPlazos(existente.expedienteId);

  return actionSuccess(undefined);
}

export async function eliminarPlazo(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const existente = await obtenerPlazo(userId, id);
  if (!existente) return actionError("Plazo no encontrado");

  await db.delete(plazos).where(and(eq(plazos.id, id), eq(plazos.userId, userId)));

  revalidarPlazos(existente.expedienteId);

  return actionSuccess(undefined);
}

/**
 * Amplía el plazo DIAS_AMPLIACION_PLAZO días hábiles a partir del
 * vencimiento actual (saltea fines de semana y feriados cargados).
 */
export async function ampliarPlazo(
  input: unknown
): Promise<ActionResult<{ fechaVencimiento: string }>> {
  const userId = await requireUserId();
  const parsed = ampliarPlazoSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  const existente = await obtenerPlazo(userId, parsed.data.id);
  if (!existente) return actionError("Plazo no encontrado");
  if (existente.cumplido) return actionError("El plazo ya está cumplido");
  if (existente.suspendidoDesde) {
    return actionError("El plazo está suspendido: reanudalo antes de ampliarlo");
  }

  const feriados = feriadosASet(await listarFeriados(userId));
  const nuevoVencimiento = formatFechaSql(
    sumarDiasHabiles(parseFechaSql(existente.fechaVencimiento), DIAS_AMPLIACION_PLAZO, feriados)
  );

  const actualizados = await db
    .update(plazos)
    .set({
      fechaVencimiento: nuevoVencimiento,
      fechaVencimientoOriginal: existente.fechaVencimientoOriginal ?? existente.fechaVencimiento,
      ampliaciones: existente.ampliaciones + 1,
    })
    .where(
      and(
        eq(plazos.id, existente.id),
        eq(plazos.userId, userId),
        // Evita ampliar dos veces si se envía la acción duplicada.
        eq(plazos.ampliaciones, existente.ampliaciones),
        isNull(plazos.suspendidoDesde)
      )
    )
    .returning({ id: plazos.id });
  if (actualizados.length === 0) {
    return actionError("El plazo cambió mientras lo ampliabas. Recargá la página.");
  }

  revalidarPlazos(existente.expedienteId);
  return actionSuccess({ fechaVencimiento: nuevoVencimiento });
}

/**
 * Suspende el plazo desde `fecha`: guarda cuántos días hábiles le quedaban
 * para recalcular el vencimiento cuando se reanude.
 */
export async function suspenderPlazo(
  input: unknown
): Promise<ActionResult<{ diasHabilesRestantes: number }>> {
  const userId = await requireUserId();
  const parsed = suspenderPlazoSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  const existente = await obtenerPlazo(userId, parsed.data.id);
  if (!existente) return actionError("Plazo no encontrado");
  if (existente.cumplido) return actionError("El plazo ya está cumplido");
  if (existente.suspendidoDesde) return actionError("El plazo ya está suspendido");

  const feriados = feriadosASet(await listarFeriados(userId));
  const restantes = diasHabilesRestantesAlSuspender(
    parseFechaSql(parsed.data.fecha),
    parseFechaSql(existente.fechaVencimiento),
    feriados
  );
  if (restantes <= 0) {
    return actionError(
      "A esa fecha el plazo ya estaba vencido: no quedan días hábiles para suspender."
    );
  }

  const actualizados = await db
    .update(plazos)
    .set({ suspendidoDesde: parsed.data.fecha, diasHabilesAlSuspender: restantes })
    .where(
      and(
        eq(plazos.id, existente.id),
        eq(plazos.userId, userId),
        isNull(plazos.suspendidoDesde)
      )
    )
    .returning({ id: plazos.id });
  if (actualizados.length === 0) return actionError("El plazo ya está suspendido");

  revalidarPlazos(existente.expedienteId);
  return actionSuccess({ diasHabilesRestantes: restantes });
}

/**
 * Reanuda un plazo suspendido desde `fecha`: el nuevo vencimiento es el
 * día hábil número N contando desde ese día, donde N son los días hábiles
 * que quedaban al suspenderlo.
 */
export async function reanudarPlazo(
  input: unknown
): Promise<ActionResult<{ fechaVencimiento: string }>> {
  const userId = await requireUserId();
  const parsed = reanudarPlazoSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  const existente = await obtenerPlazo(userId, parsed.data.id);
  if (!existente) return actionError("Plazo no encontrado");
  if (!existente.suspendidoDesde || existente.diasHabilesAlSuspender === null) {
    return actionError("El plazo no está suspendido");
  }
  if (parsed.data.fecha < existente.suspendidoDesde) {
    return actionError(
      `La fecha de reanudación no puede ser anterior a la suspensión (${existente.suspendidoDesde}).`,
      { fecha: ["Debe ser igual o posterior a la fecha de suspensión"] }
    );
  }

  const feriados = feriadosASet(await listarFeriados(userId));
  const nuevoVencimiento = formatFechaSql(
    vencimientoAlReanudar(
      parseFechaSql(parsed.data.fecha),
      existente.diasHabilesAlSuspender,
      feriados
    )
  );

  const actualizados = await db
    .update(plazos)
    .set({
      fechaVencimiento: nuevoVencimiento,
      suspendidoDesde: null,
      diasHabilesAlSuspender: null,
    })
    .where(
      and(
        eq(plazos.id, existente.id),
        eq(plazos.userId, userId),
        isNotNull(plazos.suspendidoDesde)
      )
    )
    .returning({ id: plazos.id });
  if (actualizados.length === 0) return actionError("El plazo no está suspendido");

  revalidarPlazos(existente.expedienteId);
  return actionSuccess({ fechaVencimiento: nuevoVencimiento });
}
