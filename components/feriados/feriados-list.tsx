"use client";

import { Plus } from "lucide-react";

import { eliminarFeriado } from "@/actions/feriados";
import { DeleteButton } from "@/components/forms/delete-button";
import { FeriadoForm } from "@/components/feriados/feriado-form";
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
import type { Feriado } from "@/lib/db/schema";

export function FeriadosList({ feriados }: { feriados: Feriado[] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <FormDialog
          trigger={
            <Button size="sm">
              <Plus />
              Agregar feriado
            </Button>
          }
          title="Agregar feriado"
        >
          {(close) => <FeriadoForm onSuccess={close} />}
        </FormDialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feriados.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No hay feriados cargados.
                </TableCell>
              </TableRow>
            )}
            {feriados.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.fecha}</TableCell>
                <TableCell>{f.nombre}</TableCell>
                <TableCell className="text-right">
                  <DeleteButton
                    action={() => eliminarFeriado(f.id)}
                    confirmMessage="¿Eliminar este feriado?"
                    successMessage="Feriado eliminado"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
