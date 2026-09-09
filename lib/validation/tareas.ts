import { z } from "zod";

import { ESTADOS_TAREA } from "@/lib/constants";

export const tareaSchema = z.object({
  expedienteId: z.string().uuid(),
  personaId: z.string().uuid().optional().or(z.literal("")),
  titulo: z.string().min(1, "El título es obligatorio").max(300),
  descripcion: z.string().max(4000).optional().or(z.literal("")),
  responsable: z.string().min(1, "El responsable es obligatorio").max(200),
  fechaLimite: z.string().min(1, "La fecha límite es obligatoria"),
  estado: z.enum(ESTADOS_TAREA),
});

export type TareaInput = z.infer<typeof tareaSchema>;
