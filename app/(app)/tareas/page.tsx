import { TareasList } from "@/components/tareas/tareas-list";
import { requireUserId } from "@/lib/auth/session";
import { listarTareasConDetalle } from "@/lib/db/queries/tareas";

export default async function TareasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const userId = await requireUserId();
  const params = await searchParams;
  const tareas = await listarTareasConDetalle(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Tareas</h1>
        <p className="text-sm text-muted-foreground">Checklist de tareas de todos los expedientes.</p>
      </div>
      <TareasList tareas={tareas} estadoInicial={params.estado ?? "todos"} />
    </div>
  );
}
