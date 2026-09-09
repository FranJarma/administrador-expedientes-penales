import { z } from "zod";

export const configuracionNotificacionesSchema = z.object({
  anticipaciones: z.record(z.string(), z.boolean()),
});

export type ConfiguracionNotificacionesInput = z.infer<
  typeof configuracionNotificacionesSchema
>;
