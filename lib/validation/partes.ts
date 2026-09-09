import { z } from "zod";

import { ROLES_PARTE } from "@/lib/constants";

export const parteSchema = z.object({
  expedienteId: z.string().uuid(),
  rol: z.enum(ROLES_PARTE),
  nombre: z.string().min(1, "El nombre es obligatorio").max(300),
});

export type ParteInput = z.infer<typeof parteSchema>;
