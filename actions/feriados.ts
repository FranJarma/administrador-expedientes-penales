"use server";

import { and, eq } from "drizzle-orm";
import { differenceInCalendarDays } from "date-fns";
import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth/session";
import {
  fechasParaCargarFeriados,
  feriadosASet,
  parseFechaSql,
} from "@/lib/business/dias-habiles";
import { db } from "@/lib/db/client";
import { listarFeriados } from "@/lib/db/queries/feriados";
import { feriados } from "@/lib/db/schema";
import { feriadoSchema, MAX_DIAS_RANGO_FERIADOS } from "@/lib/validation/feriados";

import { actionError, actionSuccess, type ActionResult } from "./types";

export async function crearFeriado(
  input: unknown
): Promise<ActionResult<{ cantidad: number }>> {
  const userId = await requireUserId();
  const parsed = feriadoSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  const desde = parseFechaSql(parsed.data.fecha);
  const hasta = parsed.data.hasta ? parseFechaSql(parsed.data.hasta) : desde;
  const cantidadDias = differenceInCalendarDays(hasta, desde) + 1;
  if (cantidadDias > MAX_DIAS_RANGO_FERIADOS) {
    return actionError(`El rango no puede superar los ${MAX_DIAS_RANGO_FERIADOS} días`, {
      hasta: [`Máximo ${MAX_DIAS_RANGO_FERIADOS} días`],
    });
  }

  const existentes = feriadosASet(await listarFeriados(userId));
  const fechas = fechasParaCargarFeriados(desde, hasta, existentes);

  if (fechas.length === 0) {
    return actionError(
      "No hay días nuevos para cargar: ya estaban cargados o caen en fin de semana"
    );
  }

  await db
    .insert(feriados)
    .values(fechas.map((fecha) => ({ userId, fecha, nombre: parsed.data.nombre })));

  revalidatePath("/feriados");
  revalidatePath("/plazos");
  revalidatePath("/dashboard");
  revalidatePath("/calendario");

  return actionSuccess({ cantidad: fechas.length });
}

export async function eliminarFeriado(id: string): Promise<ActionResult> {
  const userId = await requireUserId();

  const [existente] = await db
    .select()
    .from(feriados)
    .where(and(eq(feriados.id, id), eq(feriados.userId, userId)))
    .limit(1);
  if (!existente) return actionError("Feriado no encontrado");

  await db.delete(feriados).where(and(eq(feriados.id, id), eq(feriados.userId, userId)));

  revalidatePath("/feriados");
  revalidatePath("/plazos");
  revalidatePath("/dashboard");
  revalidatePath("/calendario");

  return actionSuccess(undefined);
}
