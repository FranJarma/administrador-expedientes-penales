import { requireUserId } from "@/lib/auth/session";
import { contarPorCategoria, enriquecerPlazos } from "@/lib/business/plazos-view";
import { feriadosASet } from "@/lib/business/dias-habiles";
import { listarExpedientes } from "@/lib/db/queries/expedientes";
import { listarFeriados } from "@/lib/db/queries/feriados";
import { listarPlazosConDetalle } from "@/lib/db/queries/plazos";
import { listarTareasConDetalle } from "@/lib/db/queries/tareas";
import { StatCard } from "@/components/dashboard/stat-card";

export default async function DashboardPage() {
  const userId = await requireUserId();

  const [expedientes, plazosRaw, tareas, feriados] = await Promise.all([
    listarExpedientes(userId),
    listarPlazosConDetalle(userId),
    listarTareasConDetalle(userId),
    listarFeriados(userId),
  ]);

  const feriadosSet = feriadosASet(feriados);
  const plazos = enriquecerPlazos(plazosRaw, feriadosSet);

  const procesales = contarPorCategoria(plazos, "procesal");
  const preventivas = contarPorCategoria(plazos, "prision_preventiva");

  // Solo cuenta personas detenidas que tienen un plazo de prisión
  // preventiva activo (no cumplido) vinculado, para no mezclarlas con
  // detenidos sin ningún vencimiento de preventiva registrado.
  const personasConPreventivaActiva = new Set(
    plazos
      .filter(
        (p) => p.plazo.categoria === "prision_preventiva" && !p.plazo.cumplido && p.persona
      )
      .map((p) => p.persona!.id)
  ).size;

  const expedientesInactivos: string[] = ["Resuelto", "Archivado"];
  const expedientesActivos = expedientes.filter(
    (e) => !expedientesInactivos.includes(e.estado)
  ).length;

  const tareasPendientes = tareas.filter((t) => t.tarea.estado === "Pendiente").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Resumen de plazos procesales, prisiones preventivas y tareas.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Plazos procesales</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          <StatCard
            label="Vencen hoy"
            value={procesales.vencenHoy}
            href="/plazos?categoria=procesal&estado=vencenHoy"
          />
          <StatCard
            label="Próximos 3 días hábiles"
            value={procesales.proximos3}
            href="/plazos?categoria=procesal&estado=urgente"
          />
          <StatCard
            label="Próximos 7 días hábiles"
            value={procesales.proximos7}
            href="/plazos?categoria=procesal&estado=proximo"
          />
          <StatCard
            label="Vencidos"
            value={procesales.vencidos}
            href="/plazos?categoria=procesal&estado=vencido"
          />
          <StatCard label="Expedientes activos" value={expedientesActivos} href="/expedientes" />
          <StatCard
            label="Plazos activos"
            value={procesales.activos}
            href="/plazos?categoria=procesal&estado=activos"
          />
          <StatCard label="Tareas pendientes" value={tareasPendientes} href="/tareas?estado=Pendiente" />
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-urgente/30 bg-urgente/5 p-4">
        <h2 className="text-sm font-medium text-urgente">Prisiones preventivas</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            variant="danger"
            label="Vencen hoy"
            value={preventivas.vencenHoy}
            href="/plazos?categoria=prision_preventiva&estado=vencenHoy"
          />
          <StatCard
            variant="danger"
            label="Próximos 3 días hábiles"
            value={preventivas.proximos3}
            href="/plazos?categoria=prision_preventiva&estado=urgente"
          />
          <StatCard
            variant="danger"
            label="Próximos 7 días hábiles"
            value={preventivas.proximos7}
            href="/plazos?categoria=prision_preventiva&estado=proximo"
          />
          <StatCard
            variant="danger"
            label="Vencidos"
            value={preventivas.vencidos}
            href="/plazos?categoria=prision_preventiva&estado=vencido"
          />
          <StatCard
            variant="danger"
            label="Personas detenidas"
            value={personasConPreventivaActiva}
            href="/plazos?categoria=prision_preventiva&estado=activos"
          />
        </div>
      </section>
    </div>
  );
}
