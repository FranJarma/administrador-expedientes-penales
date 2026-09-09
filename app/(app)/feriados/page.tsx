import { FeriadosList } from "@/components/feriados/feriados-list";
import { requireUserId } from "@/lib/auth/session";
import { listarFeriados } from "@/lib/db/queries/feriados";

export default async function FeriadosPage() {
  const userId = await requireUserId();
  const feriados = await listarFeriados(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Feriados</h1>
        <p className="text-sm text-muted-foreground">
          Días no hábiles usados para calcular vencimientos de plazos.
        </p>
      </div>
      <FeriadosList feriados={feriados} />
    </div>
  );
}
