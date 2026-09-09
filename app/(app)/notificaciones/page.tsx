import Link from "next/link";

import { SemaforoBadge } from "@/components/plazos/semaforo-badge";
import { NotificacionesForm } from "@/components/notificaciones/notificaciones-form";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireUserId } from "@/lib/auth/session";
import { feriadosASet } from "@/lib/business/dias-habiles";
import { enriquecerPlazos } from "@/lib/business/plazos-view";
import { ANTICIPACIONES_DEFAULT, CATEGORIA_PLAZO_LABEL } from "@/lib/constants";
import { listarFeriados } from "@/lib/db/queries/feriados";
import { obtenerConfiguracionNotificaciones } from "@/lib/db/queries/notificaciones";
import { listarPlazosConDetalle } from "@/lib/db/queries/plazos";

export default async function NotificacionesPage() {
  const userId = await requireUserId();

  const [plazosRaw, feriados, config] = await Promise.all([
    listarPlazosConDetalle(userId),
    listarFeriados(userId),
    obtenerConfiguracionNotificaciones(userId),
  ]);

  const anticipaciones = (config.anticipaciones as Record<string, boolean>) ?? ANTICIPACIONES_DEFAULT;
  const plazos = enriquecerPlazos(plazosRaw, feriadosASet(feriados));

  const alertas = plazos
    .filter((p) => !p.plazo.cumplido)
    .filter(
      (p) =>
        p.estado === "vencido" ||
        (p.diasHabilesRestantes !== null && anticipaciones[String(p.diasHabilesRestantes)])
    )
    .sort((a, b) => (a.plazo.fechaVencimiento < b.plazo.fechaVencimiento ? -1 : 1));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Notificaciones</h1>
        <p className="text-sm text-muted-foreground">
          Configurá tus alertas y revisá los plazos que requieren atención.
        </p>
      </div>

      <NotificacionesForm anticipacionesIniciales={anticipaciones} />

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Expediente</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alertas.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay alertas activas por el momento.
                </TableCell>
              </TableRow>
            )}
            {alertas.map((item) => (
              <TableRow key={item.plazo.id}>
                <TableCell>
                  <Link
                    href={`/expedientes/${item.expediente.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {item.expediente.numero}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={item.plazo.categoria === "prision_preventiva" ? "urgente" : "outline"}>
                    {CATEGORIA_PLAZO_LABEL[item.plazo.categoria]}
                  </Badge>
                </TableCell>
                <TableCell>{item.plazo.tipo}</TableCell>
                <TableCell>{item.plazo.fechaVencimiento}</TableCell>
                <TableCell>
                  <SemaforoBadge estado={item.estado} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
