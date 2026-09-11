"use client";

import { Pencil, Plus } from "lucide-react";

import { eliminarAudiencia } from "@/actions/audiencias";
import { AudienciaForm } from "@/components/expedientes/audiencia-form";
import { DeleteButton } from "@/components/forms/delete-button";
import { FormDialog } from "@/components/forms/form-dialog";
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

export function AudienciasTab({
  expedienteId,
  audiencias,
}: {
  expedienteId: string;
  audiencias: Audiencia[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
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
              <TableHead>Fecha</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Lugar</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {audiencias.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Todavía no hay audiencias cargadas.
                </TableCell>
              </TableRow>
            )}
            {audiencias.map((audiencia) => (
              <TableRow key={audiencia.id}>
                <TableCell>{audiencia.fecha}</TableCell>
                <TableCell>{audiencia.hora?.slice(0, 5) ?? "—"}</TableCell>
                <TableCell>{audiencia.tipo}</TableCell>
                <TableCell>{audiencia.lugar ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <FormDialog
                      trigger={
                        <Button variant="ghost" size="icon">
                          <Pencil className="size-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      }
                      title="Editar audiencia"
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
                      confirmMessage="¿Eliminar esta audiencia?"
                      successMessage="Audiencia eliminada"
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
