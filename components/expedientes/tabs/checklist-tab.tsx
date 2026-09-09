"use client";

import { Pencil, Plus } from "lucide-react";

import { eliminarTarea } from "@/actions/tareas";
import { DeleteButton } from "@/components/forms/delete-button";
import { FormDialog } from "@/components/forms/form-dialog";
import { TareaForm } from "@/components/tareas/tarea-form";
import { EstadoTareaSelect } from "@/components/tareas/estado-tarea-select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Persona, Tarea } from "@/lib/db/schema";

export function ChecklistTab({
  expedienteId,
  personas,
  tareas,
}: {
  expedienteId: string;
  personas: Persona[];
  tareas: { tarea: Tarea; persona: Persona | null }[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <FormDialog
          trigger={
            <Button size="sm">
              <Plus />
              Nueva tarea
            </Button>
          }
          title="Nueva tarea"
        >
          {(close) => (
            <TareaForm expedienteId={expedienteId} personas={personas} onSuccess={close} />
          )}
        </FormDialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Persona</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Fecha límite</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tareas.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Todavía no hay tareas cargadas.
                </TableCell>
              </TableRow>
            )}
            {tareas.map(({ tarea, persona }) => (
              <TableRow key={tarea.id}>
                <TableCell className="font-medium">{tarea.titulo}</TableCell>
                <TableCell>{persona?.nombre ?? "—"}</TableCell>
                <TableCell>{tarea.responsable}</TableCell>
                <TableCell>{tarea.fechaLimite}</TableCell>
                <TableCell>
                  <EstadoTareaSelect id={tarea.id} estado={tarea.estado} />
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
                      title="Editar tarea"
                    >
                      {(close) => (
                        <TareaForm
                          expedienteId={expedienteId}
                          personas={personas}
                          tarea={tarea}
                          onSuccess={close}
                        />
                      )}
                    </FormDialog>
                    <DeleteButton
                      action={() => eliminarTarea(tarea.id)}
                      confirmMessage="¿Eliminar esta tarea?"
                      successMessage="Tarea eliminada"
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
