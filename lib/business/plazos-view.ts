import { contarDiasHabilesEntre, formatFechaSql, parseFechaSql } from "./dias-habiles";
import { calcularEstadoSemaforo, type EstadoSemaforo } from "./semaforo";
import type { PlazoConDetalle } from "@/lib/db/queries/plazos";

export type PlazoEnriquecido = PlazoConDetalle & {
  estado: EstadoSemaforo;
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
    const estado = calcularEstadoSemaforo({
      fechaVencimiento: item.plazo.fechaVencimiento,
      cumplido: item.plazo.cumplido,
      feriados,
      hoy,
    });
    const diasHabilesRestantes =
      estado === "vencido" || estado === "cumplido"
        ? null
        : contarDiasHabilesEntre(hoy, parseFechaSql(item.plazo.fechaVencimiento), feriados);
    return {
      ...item,
      estado,
      vencimientoHoy: !item.plazo.cumplido && item.plazo.fechaVencimiento === hoyStr,
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
