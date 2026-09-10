import { z } from "zod";

export const audienciaSchema = z.object({
  expedienteId: z.string().uuid(),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  hora: z.string().optional().or(z.literal("")),
  tipo: z.string().min(1, "El tipo es obligatorio").max(200),
  lugar: z.string().max(300).optional().or(z.literal("")),
  observaciones: z.string().max(4000).optional().or(z.literal("")),
});

export type AudienciaInput = z.infer<typeof audienciaSchema>;
