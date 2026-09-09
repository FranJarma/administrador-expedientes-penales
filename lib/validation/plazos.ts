import { z } from "zod";

import { CATEGORIAS_PLAZO } from "@/lib/constants";

export const plazoSchema = z
  .object({
    expedienteId: z.string().uuid(),
    categoria: z.enum(CATEGORIAS_PLAZO),
    personaId: z.string().uuid().optional().or(z.literal("")),
    tipo: z.string().min(1, "El tipo es obligatorio").max(200),
    descripcion: z.string().max(4000).optional().or(z.literal("")),
    fechaInicio: z.string().min(1, "La fecha de inicio es obligatoria"),
    fechaVencimiento: z.string().min(1, "La fecha de vencimiento es obligatoria"),
    responsable: z.string().min(1, "El responsable es obligatorio").max(200),
    observaciones: z.string().max(4000).optional().or(z.literal("")),
  })
  .refine((data) => data.categoria !== "prision_preventiva" || !!data.personaId, {
    message: "Debe seleccionar la persona detenida",
    path: ["personaId"],
  });

export type PlazoInput = z.infer<typeof plazoSchema>;

export const marcarCumplidoSchema = z.object({
  id: z.string().uuid(),
  cumplido: z.boolean(),
});
