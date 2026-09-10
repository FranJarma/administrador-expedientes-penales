import { ExpedientesList } from "@/components/expedientes/expedientes-list";
import { requireUserId } from "@/lib/auth/session";
import { listarExpedientes } from "@/lib/db/queries/expedientes";
import { obtenerExpedientesConDetenidos } from "@/lib/db/queries/personas";

export default async function ExpedientesPage() {
  const userId = await requireUserId();
  const [expedientes, expedientesConDetenidos] = await Promise.all([
    listarExpedientes(userId),
    obtenerExpedientesConDetenidos(userId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Expedientes</h1>
        <p className="text-sm text-muted-foreground">
          Gestioná los expedientes penales a tu cargo.
        </p>
      </div>
      <ExpedientesList
        expedientes={expedientes}
        expedientesConDetenidos={[...expedientesConDetenidos]}
      />
    </div>
  );
}
