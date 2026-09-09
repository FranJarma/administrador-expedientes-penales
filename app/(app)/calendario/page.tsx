import { CalendarioView } from "@/components/calendario/calendario-view";
import { requireUserId } from "@/lib/auth/session";
import { feriadosASet } from "@/lib/business/dias-habiles";
import { enriquecerPlazos } from "@/lib/business/plazos-view";
import { listarFeriados } from "@/lib/db/queries/feriados";
import { obtenerExpedientesConDetenidos } from "@/lib/db/queries/personas";
import { listarPlazosConDetalle } from "@/lib/db/queries/plazos";

export default async function CalendarioPage() {
  const userId = await requireUserId();

  const [plazosRaw, feriados, expedientesConDetenidos] = await Promise.all([
    listarPlazosConDetalle(userId),
    listarFeriados(userId),
    obtenerExpedientesConDetenidos(userId),
  ]);

  const plazosEnriquecidos = enriquecerPlazos(plazosRaw, feriadosASet(feriados));

  const plazos = plazosEnriquecidos.map((item) => ({
    id: item.plazo.id,
    expedienteId: item.expediente.id,
    numero: item.expediente.numero,
    tipo: item.plazo.tipo,
    fechaVencimiento: item.plazo.fechaVencimiento,
    estado: item.estado,
    tieneDetenido: expedientesConDetenidos.has(item.expediente.id),
    cumplido: item.plazo.cumplido,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Calendario</h1>
        <p className="text-sm text-muted-foreground">
          Vencimientos de plazos procesales y prisiones preventivas.
        </p>
      </div>
      <CalendarioView plazos={plazos} />
    </div>
  );
}
