import { z } from "zod";

import { CLASES_AUDIENCIA, resultadosPorClase } from "@/lib/constants";

export const audienciaSchema = z
  .object({
    expedienteId: z.string().uuid(),
    clase: z.enum(CLASES_AUDIENCIA),
    fecha: z.string().min(1, "La fecha es obligatoria"),
    hora: z.string().optional().or(z.literal("")),
    tipo: z.string().min(1, "El tipo es obligatorio").max(200),
    lugar: z.string().max(300).optional().or(z.literal("")),
    observaciones: z.string().max(4000).optional().or(z.literal("")),
    resultado: z.string().max(100).optional().or(z.literal("")),
    resultadoDetalle: z.string().max(4000).optional().or(z.literal("")),
  })
  .refine((data) => !data.resultado || resultadosPorClase(data.clase).includes(data.resultado), {
    message: "Resultado inválido",
    path: ["resultado"],
  });

export type AudienciaInput = z.infer<typeof audienciaSchema>;
