"use client";

import { Pencil, Plus } from "lucide-react";

import { eliminarParte } from "@/actions/partes";
import { DeleteButton } from "@/components/forms/delete-button";
import { FormDialog } from "@/components/forms/form-dialog";
import { ParteForm } from "@/components/expedientes/parte-form";
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
import type { Parte } from "@/lib/db/schema";

export function PartesTab({
  expedienteId,
  partes,
}: {
  expedienteId: string;
  partes: Parte[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <FormDialog
          trigger={
            <Button size="sm">
              <Plus />
              Agregar parte
            </Button>
          }
          title="Agregar parte"
        >
          {(close) => <ParteForm expedienteId={expedienteId} onSuccess={close} />}
        </FormDialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rol</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partes.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Todavía no hay partes cargadas.
                </TableCell>
              </TableRow>
            )}
            {partes.map((parte) => (
              <TableRow key={parte.id}>
                <TableCell>
                  <Badge variant="outline">{parte.rol}</Badge>
                </TableCell>
                <TableCell>{parte.nombre}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <FormDialog
                      trigger={
                        <Button variant="ghost" size="icon">
                          <Pencil className="size-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      }
                      title="Editar parte"
                    >
                      {(close) => (
                        <ParteForm expedienteId={expedienteId} parte={parte} onSuccess={close} />
                      )}
                    </FormDialog>
                    <DeleteButton
                      action={() => eliminarParte(parte.id)}
                      confirmMessage="¿Eliminar esta parte?"
                      successMessage="Parte eliminada"
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
