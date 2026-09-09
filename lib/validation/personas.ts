import { z } from "zod";

import { LUGARES_DETENCION, SITUACIONES_PERSONA } from "@/lib/constants";

export const personaSchema = z
  .object({
    expedienteId: z.string().uuid(),
    nombre: z.string().min(1, "El nombre es obligatorio").max(300),
    situacion: z.enum(SITUACIONES_PERSONA),
    lugarDetencion: z.enum(LUGARES_DETENCION).optional().or(z.literal("")),
    defensor: z.string().max(300).optional().or(z.literal("")),
    observaciones: z.string().max(4000).optional().or(z.literal("")),
  })
  .refine(
    (data) => data.situacion !== "Detenido" || !!data.lugarDetencion,
    {
      message: "El lugar de detención es obligatorio para una persona detenida",
      path: ["lugarDetencion"],
    }
  );

export type PersonaInput = z.infer<typeof personaSchema>;
