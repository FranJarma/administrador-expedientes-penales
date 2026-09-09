import { asc, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { feriados } from "@/lib/db/schema";

export async function listarFeriados(userId: string) {
  return db.select().from(feriados).where(eq(feriados.userId, userId)).orderBy(asc(feriados.fecha));
}
