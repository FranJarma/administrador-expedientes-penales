import { contarDiasHabilesEntre, formatFechaSql, parseFechaSql } from "./dias-habiles";
import {
  calcularEstadoPlazo,
  semaforoDePlazo,
  type EstadoPlazo,
  type EstadoSemaforo,
} from "./semaforo";
import type { PlazoConDetalle } from "@/lib/db/queries/plazos";

export type PlazoEnriquecido = PlazoConDetalle & {
  estado: EstadoSemaforo;
  estadoPlazo: EstadoPlazo;
  vencimientoHoy: boolean;
  diasHabilesRestantes: number | null;
};

export function enriquecerPlazos(
  plazos: PlazoConDetalle[],
  feriados: Set<string>,
  hoy: Date = new Date()
): PlazoEnriquecido[] {
  const hoyStr = formatFechaSql(hoy);
  return plazos.map((item) => {
    const estado = semaforoDePlazo(item.plazo, feriados, hoy);
    const corre = estado !== "vencido" && estado !== "cumplido" && estado !== "suspendido";
    const diasHabilesRestantes = corre
      ? contarDiasHabilesEntre(hoy, parseFechaSql(item.plazo.fechaVencimiento), feriados)
      : null;
    return {
      ...item,
      estado,
      estadoPlazo: calcularEstadoPlazo(estado, item.plazo.ampliaciones),
      vencimientoHoy: corre && item.plazo.fechaVencimiento === hoyStr,
      diasHabilesRestantes,
    };
  });
}

export function contarPorCategoria(
  plazos: PlazoEnriquecido[],
  categoria: "procesal" | "prision_preventiva"
) {
  const filtrados = plazos.filter((p) => p.plazo.categoria === categoria);
  return {
    vencenHoy: filtrados.filter((p) => p.vencimientoHoy).length,
    proximos3: filtrados.filter((p) => p.estado === "urgente").length,
    proximos7: filtrados.filter((p) => p.estado === "proximo").length,
    vencidos: filtrados.filter((p) => p.estado === "vencido").length,
    activos: filtrados.filter((p) => !p.plazo.cumplido).length,
  };
}
