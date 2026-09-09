import "dotenv/config";

import argon2 from "argon2";
import { eq } from "drizzle-orm";

import { ANTICIPACIONES_DEFAULT } from "@/lib/constants";
import { db } from "@/lib/db/client";
import { configuracionNotificaciones, feriados, users } from "@/lib/db/schema";
import { FERIADOS_2026 } from "@/lib/data/feriados-2026";

async function main() {
  const nombre = process.env.ADMIN_NOMBRE;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!nombre || !email || !password) {
    throw new Error(
      "Definí ADMIN_NOMBRE, ADMIN_EMAIL y ADMIN_PASSWORD en el .env antes de correr el seed."
    );
  }

  const emailNormalizado = email.toLowerCase();

  const [existente] = await db
    .select()
    .from(users)
    .where(eq(users.email, emailNormalizado))
    .limit(1);

  if (existente) {
    console.log(`El usuario admin ${emailNormalizado} ya existe. No se hicieron cambios.`);
    return;
  }

  const passwordHash = await argon2.hash(password);

  const [admin] = await db
    .insert(users)
    .values({
      nombre,
      email: emailNormalizado,
      passwordHash,
      rol: "admin",
    })
    .returning({ id: users.id });

  await db.insert(configuracionNotificaciones).values({
    userId: admin.id,
    anticipaciones: ANTICIPACIONES_DEFAULT,
  });

  await db.insert(feriados).values(
    FERIADOS_2026.map((f) => ({ userId: admin.id, fecha: f.fecha, nombre: f.nombre }))
  );

  console.log(`Usuario admin creado: ${emailNormalizado}`);
  console.log(`Feriados 2026 precargados: ${FERIADOS_2026.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
