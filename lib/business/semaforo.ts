import { isBefore, startOfDay } from "date-fns";

import { contarDiasHabilesEntre, parseFechaSql } from "./dias-habiles";

export type EstadoSemaforo = "vencido" | "urgente" | "proximo" | "lejano" | "cumplido";

export function calcularEstadoSemaforo(params: {
  fechaVencimiento: string;
  cumplido: boolean;
  feriados: Set<string>;
  hoy?: Date;
}): EstadoSemaforo {
  const { fechaVencimiento, cumplido, feriados } = params;

  if (cumplido) return "cumplido";

  const hoy = startOfDay(params.hoy ?? new Date());
  const vencimiento = parseFechaSql(fechaVencimiento);

  if (isBefore(vencimiento, hoy)) return "vencido";

  const habiles = contarDiasHabilesEntre(hoy, vencimiento, feriados);
  if (habiles <= 3) return "urgente";
  if (habiles <= 7) return "proximo";
  return "lejano";
}

export const ESTADO_SEMAFORO_LABEL: Record<EstadoSemaforo, string> = {
  vencido: "Vencido",
  urgente: "Urgente",
  proximo: "Próximo",
  lejano: "Lejano",
  cumplido: "Cumplido",
};

export const ESTADO_SEMAFORO_BADGE_VARIANT: Record<
  EstadoSemaforo,
  "urgente" | "warning" | "success" | "secondary" | "outline"
> = {
  vencido: "urgente",
  urgente: "urgente",
  proximo: "warning",
  lejano: "success",
  cumplido: "secondary",
};
