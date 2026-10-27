import { isBefore, startOfDay } from "date-fns";

import { contarDiasHabilesEntre, parseFechaSql } from "./dias-habiles";

/**
 * Urgencia del plazo (semáforo). Se usa para colores, filtros, dashboard y
 * alertas. Un plazo suspendido no corre: no cuenta como urgente ni vencido.
 */
export type EstadoSemaforo =
  | "vencido"
  | "urgente"
  | "proximo"
  | "lejano"
  | "cumplido"
  | "suspendido";

export function calcularEstadoSemaforo(params: {
  fechaVencimiento: string;
  cumplido: boolean;
  suspendido?: boolean;
  feriados: Set<string>;
  hoy?: Date;
}): EstadoSemaforo {
  const { fechaVencimiento, cumplido, suspendido, feriados } = params;

  if (cumplido) return "cumplido";
  if (suspendido) return "suspendido";

  const hoy = startOfDay(params.hoy ?? new Date());
  const vencimiento = parseFechaSql(fechaVencimiento);

  if (isBefore(vencimiento, hoy)) return "vencido";

  const habiles = contarDiasHabilesEntre(hoy, vencimiento, feriados);
  if (habiles <= 3) return "urgente";
  if (habiles <= 7) return "proximo";
  return "lejano";
}

/** Atajo para calcular el semáforo directamente desde una fila de `plazos`. */
export function semaforoDePlazo(
  plazo: {
    fechaVencimiento: string;
    cumplido: boolean;
    suspendidoDesde: string | null;
  },
  feriados: Set<string>,
  hoy?: Date
): EstadoSemaforo {
  return calcularEstadoSemaforo({
    fechaVencimiento: plazo.fechaVencimiento,
    cumplido: plazo.cumplido,
    suspendido: plazo.suspendidoDesde !== null,
    feriados,
    hoy,
  });
}

export const ESTADO_SEMAFORO_LABEL: Record<EstadoSemaforo, string> = {
  vencido: "Vencido",
  urgente: "Urgente",
  proximo: "Próximo",
  lejano: "Lejano",
  cumplido: "Cumplido",
  suspendido: "Suspendido",
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
  suspendido: "outline",
};

/**
 * Estado del plazo tal como se muestra en las listas: corriendo, ampliado,
 * suspendido, vencido o cumplido.
 */
export type EstadoPlazo = "corriendo" | "ampliado" | "suspendido" | "vencido" | "cumplido";

export function calcularEstadoPlazo(
  semaforo: EstadoSemaforo,
  ampliaciones: number
): EstadoPlazo {
  if (semaforo === "cumplido") return "cumplido";
  if (semaforo === "suspendido") return "suspendido";
  if (semaforo === "vencido") return "vencido";
  return ampliaciones > 0 ? "ampliado" : "corriendo";
}

export const ESTADO_PLAZO_LABEL: Record<EstadoPlazo, string> = {
  corriendo: "Corriendo",
  ampliado: "Ampliado",
  suspendido: "Suspendido",
  vencido: "Vencido",
  cumplido: "Cumplido",
};
