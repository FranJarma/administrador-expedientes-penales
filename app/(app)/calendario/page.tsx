import { CalendarioView, type EventoCalendario } from "@/components/calendario/calendario-view";
import { requireUserId } from "@/lib/auth/session";
import { feriadosASet } from "@/lib/business/dias-habiles";
import { enriquecerPlazos } from "@/lib/business/plazos-view";
import { listarAudienciasConDetalle } from "@/lib/db/queries/audiencias";
import { listarFeriados } from "@/lib/db/queries/feriados";
import { obtenerExpedientesConDetenidos } from "@/lib/db/queries/personas";
import { listarPlazosConDetalle } from "@/lib/db/queries/plazos";

export default async function CalendarioPage() {
  const userId = await requireUserId();

  const [plazosRaw, audienciasRaw, feriados, expedientesConDetenidos] = await Promise.all([
    listarPlazosConDetalle(userId),
    listarAudienciasConDetalle(userId),
    listarFeriados(userId),
    obtenerExpedientesConDetenidos(userId),
  ]);

  const plazosEnriquecidos = enriquecerPlazos(plazosRaw, feriadosASet(feriados));

  const eventosPlazos: EventoCalendario[] = plazosEnriquecidos.map((item) => ({
    kind: "plazo",
    id: item.plazo.id,
    expedienteId: item.expediente.id,
    numero: item.expediente.numero,
    tipo: item.plazo.tipo,
    fecha: item.plazo.fechaVencimiento,
    estado: item.estado,
    tieneDetenido: expedientesConDetenidos.has(item.expediente.id),
    cumplido: item.plazo.cumplido,
  }));

  const eventosAudiencias: EventoCalendario[] = audienciasRaw.map((item) => ({
    kind: "audiencia",
    id: item.audiencia.id,
    expedienteId: item.expediente.id,
    numero: item.expediente.numero,
    tipo: item.audiencia.tipo,
    fecha: item.audiencia.fecha,
    hora: item.audiencia.hora?.slice(0, 5) ?? null,
    tieneDetenido: expedientesConDetenidos.has(item.expediente.id),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Calendario</h1>
        <p className="text-sm text-muted-foreground">
          Vencimientos de plazos, prisiones preventivas y audiencias.
        </p>
      </div>
      <CalendarioView eventos={[...eventosPlazos, ...eventosAudiencias]} />
    </div>
  );
}
