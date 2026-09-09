"use server";

import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { configuracionNotificaciones } from "@/lib/db/schema";
import { configuracionNotificacionesSchema } from "@/lib/validation/notificaciones";

import { actionError, actionSuccess, type ActionResult } from "./types";

export async function actualizarConfiguracionNotificaciones(
  input: unknown
): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = configuracionNotificacionesSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  await db
    .insert(configuracionNotificaciones)
    .values({ userId, anticipaciones: parsed.data.anticipaciones })
    .onConflictDoUpdate({
      target: configuracionNotificaciones.userId,
      set: { anticipaciones: parsed.data.anticipaciones },
    });

  revalidatePath("/notificaciones");

  return actionSuccess(undefined);
}
