import { z } from "zod";

const fechaSql = z.iso.date({ error: "Fecha inválida" });

/** Máximo de días que se pueden cargar de una vez (alcanza para una feria). */
export const MAX_DIAS_RANGO_FERIADOS = 62;

export const feriadoSchema = z
  .object({
    fecha: fechaSql,
    // Opcional: si se completa, se carga cada día hábil entre `fecha` y
    // `hasta` (útil para la feria judicial).
    hasta: fechaSql.optional().or(z.literal("")),
    nombre: z.string().min(1, "El nombre es obligatorio").max(300),
  })
  .refine((data) => !data.hasta || data.hasta >= data.fecha, {
    message: "La fecha final debe ser igual o posterior a la inicial",
    path: ["hasta"],
  });

export type FeriadoInput = z.infer<typeof feriadoSchema>;
