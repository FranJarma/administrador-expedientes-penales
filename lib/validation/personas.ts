import { z } from "zod";

import { LUGARES_DETENCION, ROLES_PERSONA, SITUACIONES_PERSONA } from "@/lib/constants";

export const personaSchema = z
  .object({
    expedienteId: z.string().uuid(),
    rol: z.enum(ROLES_PERSONA),
    nombre: z.string().min(1, "El nombre es obligatorio").max(300),
    // Solo aplica a imputados; para una víctima se guarda "Libre".
    situacion: z.enum(SITUACIONES_PERSONA).optional(),
    lugarDetencion: z.enum(LUGARES_DETENCION).optional().or(z.literal("")),
    defensor: z.string().max(300).optional().or(z.literal("")),
    observaciones: z.string().max(4000).optional().or(z.literal("")),
  })
  .refine(
    (data) => data.rol !== "Imputado" || !!data.situacion,
    {
      message: "La situación es obligatoria para un imputado",
      path: ["situacion"],
    }
  )
  .refine(
    (data) => data.rol !== "Imputado" || data.situacion !== "Detenido" || !!data.lugarDetencion,
    {
      message: "El lugar de detención es obligatorio para una persona detenida",
      path: ["lugarDetencion"],
    }
  );

export type PersonaInput = z.infer<typeof personaSchema>;

/** Situación y lugar de detención a guardar según el rol de la persona. */
export function situacionAGuardar(data: PersonaInput) {
  if (data.rol !== "Imputado") {
    return { situacion: "Libre" as const, lugarDetencion: null };
  }
  const situacion = data.situacion ?? "Libre";
  return {
    situacion,
    lugarDetencion:
      situacion === "Detenido" && data.lugarDetencion ? data.lugarDetencion : null,
  };
}
