import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "El email es obligatorio").email("Email inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registroSchema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio").max(200),
  email: z.string().min(1, "El email es obligatorio").email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  codigoInvitacion: z.string().min(1, "El código de invitación es obligatorio"),
});

export type RegistroInput = z.infer<typeof registroSchema>;

export const crearInvitacionSchema = z.object({
  cantidad: z.coerce.number().int().min(1).max(20).default(1),
});

export type CrearInvitacionInput = z.infer<typeof crearInvitacionSchema>;
