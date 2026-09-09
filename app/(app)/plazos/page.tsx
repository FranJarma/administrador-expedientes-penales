import { PlazosList } from "@/components/plazos/plazos-list";
import { requireUserId } from "@/lib/auth/session";
import { feriadosASet } from "@/lib/business/dias-habiles";
import { enriquecerPlazos } from "@/lib/business/plazos-view";
import { listarFeriados } from "@/lib/db/queries/feriados";
import { listarPlazosConDetalle } from "@/lib/db/queries/plazos";

export default async function PlazosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; estado?: string }>;
}) {
  const userId = await requireUserId();
  const params = await searchParams;

  const [plazosRaw, feriados] = await Promise.all([
    listarPlazosConDetalle(userId),
    listarFeriados(userId),
  ]);

  const plazos = enriquecerPlazos(plazosRaw, feriadosASet(feriados));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Plazos</h1>
        <p className="text-sm text-muted-foreground">
          Todos los plazos procesales y de prisión preventiva.
        </p>
      </div>
      <PlazosList
        plazos={plazos}
        categoriaInicial={params.categoria ?? "todos"}
        estadoInicial={params.estado ?? "todos"}
      />
    </div>
  );
}
