import type { PlazoEnriquecido } from "./plazos-view";
import type { Expediente } from "@/lib/db/schema";
import type { TareaConDetalle } from "@/lib/db/queries/tareas";

export type CargaResponsable = {
  responsable: string;
  expedientesAsignados: number;
  plazosActivos: number;
  vencenHoy: number;
  proximos: number;
  vencidos: number;
  tareasPendientes: number;
  cargaTotal: number;
};

export function calcularCargaDeTrabajo(
  expedientes: Expediente[],
  plazos: PlazoEnriquecido[],
  tareas: TareaConDetalle[]
): { filas: CargaResponsable[]; promedio: number } {
  const responsables = new Set<string>();
  expedientes.forEach((e) => responsables.add(e.responsable));
  plazos.forEach((p) => responsables.add(p.plazo.responsable));
  tareas.forEach((t) => responsables.add(t.tarea.responsable));

  const filas = Array.from(responsables).map((responsable) => {
    const expedientesAsignados = expedientes.filter(
      (e) => e.responsable === responsable
    ).length;

    const plazosDe = plazos.filter((p) => p.plazo.responsable === responsable);
    const plazosActivos = plazosDe.filter((p) => !p.plazo.cumplido).length;
    const vencenHoy = plazosDe.filter((p) => p.vencimientoHoy).length;
    const proximos = plazosDe.filter(
      (p) => p.estado === "urgente" || p.estado === "proximo"
    ).length;
    const vencidos = plazosDe.filter((p) => p.estado === "vencido").length;

    const tareasPendientes = tareas.filter(
      (t) => t.tarea.responsable === responsable && t.tarea.estado === "Pendiente"
    ).length;

    return {
      responsable,
      expedientesAsignados,
      plazosActivos,
      vencenHoy,
      proximos,
      vencidos,
      tareasPendientes,
      cargaTotal: expedientesAsignados + plazosActivos + tareasPendientes,
    };
  });

  const promedio =
    filas.length > 0 ? filas.reduce((sum, f) => sum + f.cargaTotal, 0) / filas.length : 0;

  filas.sort((a, b) => b.cargaTotal - a.cargaTotal);

  return { filas, promedio };
}
