import { requireUserId } from "@/lib/auth/session";
import { feriadosASet } from "@/lib/business/dias-habiles";
import { calcularCargaDeTrabajo } from "@/lib/business/carga-trabajo";
import { enriquecerPlazos } from "@/lib/business/plazos-view";
import { listarExpedientes } from "@/lib/db/queries/expedientes";
import { listarFeriados } from "@/lib/db/queries/feriados";
import { listarPlazosConDetalle } from "@/lib/db/queries/plazos";
import { listarTareasConDetalle } from "@/lib/db/queries/tareas";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default async function CargaDeTrabajoPage() {
  const userId = await requireUserId();

  const [expedientes, plazosRaw, tareas, feriados] = await Promise.all([
    listarExpedientes(userId),
    listarPlazosConDetalle(userId),
    listarTareasConDetalle(userId),
    listarFeriados(userId),
  ]);

  const plazos = enriquecerPlazos(plazosRaw, feriadosASet(feriados));
  const { filas, promedio } = calcularCargaDeTrabajo(expedientes, plazos, tareas);
  const umbral = promedio * 1.3;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Carga de trabajo</h1>
        <p className="text-sm text-muted-foreground">
          Distribución de expedientes, plazos y tareas por responsable. Se resalta a quien
          supera el promedio del equipo en más de un 30%.
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Responsable</TableHead>
              <TableHead className="text-right">Expedientes asignados</TableHead>
              <TableHead className="text-right">Plazos activos</TableHead>
              <TableHead className="text-right">Vencen hoy</TableHead>
              <TableHead className="text-right">Próximos</TableHead>
              <TableHead className="text-right">Vencidos</TableHead>
              <TableHead className="text-right">Tareas pendientes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filas.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Todavía no hay datos para mostrar.
                </TableCell>
              </TableRow>
            )}
            {filas.map((fila) => {
              const sobrecargado = promedio > 0 && fila.cargaTotal > umbral;
              return (
                <TableRow
                  key={fila.responsable}
                  className={cn(sobrecargado && "bg-urgente/10")}
                >
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      {fila.responsable}
                      {sobrecargado && <Badge variant="urgente">Sobrecarga</Badge>}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {fila.expedientesAsignados}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{fila.plazosActivos}</TableCell>
                  <TableCell className="text-right tabular-nums">{fila.vencenHoy}</TableCell>
                  <TableCell className="text-right tabular-nums">{fila.proximos}</TableCell>
                  <TableCell className="text-right tabular-nums">{fila.vencidos}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {fila.tareasPendientes}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {promedio > 0 && (
        <p className="text-xs text-muted-foreground">
          Carga promedio del equipo: {promedio.toFixed(1)} (umbral de sobrecarga: {umbral.toFixed(1)})
        </p>
      )}
    </div>
  );
}
