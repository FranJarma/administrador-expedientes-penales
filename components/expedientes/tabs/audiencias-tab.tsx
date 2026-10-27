"use client";

import { Pencil, Plus } from "lucide-react";

import { eliminarAudiencia } from "@/actions/audiencias";
import { ESTILO_CLASE } from "@/components/calendario/estilos-clase";
import { AudienciaForm } from "@/components/expedientes/audiencia-form";
import { DeleteButton } from "@/components/forms/delete-button";
import { FormDialog } from "@/components/forms/form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Audiencia } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export function AudienciasTab({
  expedienteId,
  audiencias,
}: {
  expedienteId: string;
  audiencias: Audiencia[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        <FormDialog
          trigger={
            <Button size="sm" variant="outline">
              <Plus />
              Nueva citación
            </Button>
          }
          title="Nueva citación"
          description="Persona citada para notificarla o tomarle un acta."
        >
          {(close) => (
            <AudienciaForm expedienteId={expedienteId} clase="Citación" onSuccess={close} />
          )}
        </FormDialog>
        <FormDialog
          trigger={
            <Button size="sm">
              <Plus />
              Nueva audiencia
            </Button>
          }
          title="Nueva audiencia"
        >
          {(close) => <AudienciaForm expedienteId={expedienteId} onSuccess={close} />}
        </FormDialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clase</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Detalle</TableHead>
              <TableHead>Lugar</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {audiencias.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Todavía no hay audiencias ni citaciones cargadas.
                </TableCell>
              </TableRow>
            )}
            {audiencias.map((audiencia) => (
              <TableRow key={audiencia.id}>
                <TableCell>
                  <Badge variant="outline" className={cn(ESTILO_CLASE[audiencia.clase].chip)}>
                    {audiencia.clase}
                  </Badge>
                </TableCell>
                <TableCell>{audiencia.fecha}</TableCell>
                <TableCell>{audiencia.hora?.slice(0, 5) ?? "—"}</TableCell>
                <TableCell>{audiencia.tipo}</TableCell>
                <TableCell>{audiencia.lugar ?? "—"}</TableCell>
                <TableCell className="max-w-xs">
                  {audiencia.resultado ? (
                    <div className="space-y-1">
                      <Badge variant={audiencia.resultado === "Realizada" ? "success" : "outline"}>
                        {audiencia.resultado}
                      </Badge>
                      {audiencia.resultadoDetalle && (
                        <p className="text-xs whitespace-pre-wrap text-muted-foreground">
                          {audiencia.resultadoDetalle}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Pendiente</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <FormDialog
                      trigger={
                        <Button variant="ghost" size="icon">
                          <Pencil className="size-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      }
                      title={audiencia.clase === "Citación" ? "Editar citación" : "Editar audiencia"}
                    >
                      {(close) => (
                        <AudienciaForm
                          expedienteId={expedienteId}
                          audiencia={audiencia}
                          onSuccess={close}
                        />
                      )}
                    </FormDialog>
                    <DeleteButton
                      action={() => eliminarAudiencia(audiencia.id)}
                      confirmMessage={
                        audiencia.clase === "Citación"
                          ? "¿Eliminar esta citación?"
                          : "¿Eliminar esta audiencia?"
                      }
                      successMessage={
                        audiencia.clase === "Citación" ? "Citación eliminada" : "Audiencia eliminada"
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
