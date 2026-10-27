import type { ClaseAudiencia } from "@/lib/constants";

/** Colores de audiencias y citaciones (calendario y pestaña del expediente). */
export const ESTILO_CLASE: Record<ClaseAudiencia, { chip: string; punto: string }> = {
  Audiencia: {
    chip: "border-audiencia/40 bg-audiencia/10 text-audiencia",
    punto: "border-audiencia/40 bg-audiencia/20",
  },
  Citación: {
    chip: "border-citacion/40 bg-citacion/10 text-citacion",
    punto: "border-citacion/40 bg-citacion/20",
  },
};
