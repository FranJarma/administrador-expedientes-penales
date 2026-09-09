"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { feriados } from "@/lib/db/schema";
import { feriadoSchema } from "@/lib/validation/feriados";

import { actionError, actionSuccess, type ActionResult } from "./types";

export async function crearFeriado(input: unknown): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId();
  const parsed = feriadoSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  const [feriado] = await db
    .insert(feriados)
    .values({ userId, fecha: parsed.data.fecha, nombre: parsed.data.nombre })
    .returning({ id: feriados.id });

  revalidatePath("/feriados");
  revalidatePath("/plazos");
  revalidatePath("/dashboard");
  revalidatePath("/calendario");

  return actionSuccess({ id: feriado.id });
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
