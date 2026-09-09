import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { configuracionNotificaciones } from "@/lib/db/schema";
import { ANTICIPACIONES_DEFAULT } from "@/lib/constants";

export async function obtenerConfiguracionNotificaciones(userId: string) {
  const [config] = await db
    .select()
    .from(configuracionNotificaciones)
    .where(eq(configuracionNotificaciones.userId, userId))
    .limit(1);

  if (config) return config;

  return {
    id: "",
    userId,
    anticipaciones: ANTICIPACIONES_DEFAULT,
  };
}
