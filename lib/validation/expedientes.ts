import { z } from "zod";

import { ESTADOS_EXPEDIENTE } from "@/lib/constants";

export const expedienteSchema = z.object({
  numero: z.string().min(1, "El número es obligatorio").max(100),
  caratula: z.string().min(1, "La carátula es obligatoria").max(500),
  fuero: z.string().min(1, "El fuero es obligatorio").max(200),
  estado: z.enum(ESTADOS_EXPEDIENTE),
  responsable: z.string().min(1, "El responsable es obligatorio").max(200),
  fechaInicio: z.string().min(1, "La fecha de inicio es obligatoria"),
  observaciones: z.string().max(4000).optional().or(z.literal("")),
});

export type ExpedienteInput = z.infer<typeof expedienteSchema>;
