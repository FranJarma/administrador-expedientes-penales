import { z } from "zod";

import { ESTADOS_EXPEDIENTE, MAX_NOTA_EXPEDIENTE, TIPOS_EXPEDIENTE } from "@/lib/constants";

/** Largo máximo de la síntesis del expediente (columna `observaciones`). */
export const MAX_OBSERVACIONES_EXPEDIENTE = 20000;

export const expedienteSchema = z.object({
  numero: z.string().min(1, "El número es obligatorio").max(100),
  caratula: z.string().min(1, "La carátula es obligatoria").max(500),
  estado: z.enum(ESTADOS_EXPEDIENTE),
  tipo: z.enum(TIPOS_EXPEDIENTE).optional().or(z.literal("")),
  fechaInicio: z.string().min(1, "La fecha de inicio es obligatoria"),
  observaciones: z
    .string()
    .max(
      MAX_OBSERVACIONES_EXPEDIENTE,
      `La síntesis no puede superar los ${MAX_OBSERVACIONES_EXPEDIENTE} caracteres`
    )
    .optional()
    .or(z.literal("")),
  nota: z
    .string()
    .max(
      MAX_NOTA_EXPEDIENTE,
      `Las observaciones no pueden superar los ${MAX_NOTA_EXPEDIENTE} caracteres`
    )
    .optional()
    .or(z.literal("")),
});

export type ExpedienteInput = z.infer<typeof expedienteSchema>;
