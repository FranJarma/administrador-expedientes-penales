import { z } from "zod";

export const feriadoSchema = z.object({
  fecha: z.string().min(1, "La fecha es obligatoria"),
  nombre: z.string().min(1, "El nombre es obligatorio").max(300),
});

export type FeriadoInput = z.infer<typeof feriadoSchema>;
