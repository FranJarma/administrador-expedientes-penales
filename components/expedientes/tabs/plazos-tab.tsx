"use client";

import { Pencil, Plus } from "lucide-react";

import { eliminarPlazo } from "@/actions/plazos";
import { DeleteButton } from "@/components/forms/delete-button";
import { FormDialog } from "@/components/forms/form-dialog";
import { PlazoForm } from "@/components/plazos/plazo-form";
import { CumplidoToggle } from "@/components/plazos/cumplido-toggle";
import { SemaforoBadge } from "@/components/plazos/semaforo-badge";
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
import { CATEGORIA_PLAZO_LABEL } from "@/lib/constants";
import type { Persona, Plazo } from "@/lib/db/schema";
import type { EstadoSemaforo } from "@/lib/business/semaforo";

export type PlazoDeExpediente = {
  plazo: Plazo;
  persona: Persona | null;
  estado: EstadoSemaforo;
};

export function PlazosTab({
  expedienteId,
  personas,
  plazos,
}: {
  expedienteId: string;
  personas: Persona[];
  plazos: PlazoDeExpediente[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <FormDialog
          trigger={
            <Button size="sm">
              <Plus />
              Nuevo plazo
            </Button>
          }
          title="Nuevo plazo"
        >
          {(close) => (
            <PlazoForm expedienteId={expedienteId} personas={personas} onSuccess={close} />
          )}
        </FormDialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoría</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Persona</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plazos.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Todavía no hay plazos cargados.
                </TableCell>
              </TableRow>
            )}
            {plazos.map(({ plazo, persona, estado }) => (
              <TableRow key={plazo.id}>
                <TableCell>
                  <Badge variant={plazo.categoria === "prision_preventiva" ? "urgente" : "outline"}>
                    {CATEGORIA_PLAZO_LABEL[plazo.categoria]}
                  </Badge>
                </TableCell>
                <TableCell>{plazo.tipo}</TableCell>
                <TableCell>{persona?.nombre ?? "—"}</TableCell>
                <TableCell>{plazo.fechaVencimiento}</TableCell>
                <TableCell>
                  <SemaforoBadge estado={estado} />
                </TableCell>
                <TableCell>{plazo.responsable}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <CumplidoToggle id={plazo.id} cumplido={plazo.cumplido} />
                    <FormDialog
                      trigger={
                        <Button variant="ghost" size="icon">
                          <Pencil className="size-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      }
                      title="Editar plazo"
                    >
                      {(close) => (
                        <PlazoForm
                          expedienteId={expedienteId}
                          personas={personas}
                          plazo={plazo}
                          onSuccess={close}
                        />
                      )}
                    </FormDialog>
                    <DeleteButton
                      action={() => eliminarPlazo(plazo.id)}
                      confirmMessage="¿Eliminar este plazo?"
                      successMessage="Plazo eliminado"
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
