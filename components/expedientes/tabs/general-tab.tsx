"use client";

import { Pencil } from "lucide-react";

import { ExpedienteForm } from "@/components/expedientes/expediente-form";
import { FormDialog } from "@/components/forms/form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Expediente } from "@/lib/db/schema";

function Campo({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

export function GeneralTab({ expediente }: { expediente: Expediente }) {
  return (
    <div className="space-y-4 rounded-lg border bg-card p-5">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Datos generales</h3>
        <FormDialog
          trigger={
            <Button variant="outline" size="sm">
              <Pencil />
              Editar
            </Button>
          }
          title="Editar expediente"
          className="sm:max-w-2xl"
        >
          {(close) => <ExpedienteForm expediente={expediente} onSuccess={close} />}
        </FormDialog>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Campo label="Número" value={expediente.numero} />
        <Campo label="Estado" value={<Badge variant="outline">{expediente.estado}</Badge>} />
        <Campo label="Tipo" value={expediente.tipo} />
        <Campo label="Fecha de inicio" value={expediente.fechaInicio} />
      </div>

      <Campo label="Carátula" value={expediente.caratula} />
      <Campo label="Observaciones" value={expediente.nota} />
      <div>
        <p className="text-xs text-muted-foreground">Síntesis</p>
        <p className="text-sm whitespace-pre-wrap [tab-size:4]">
          {expediente.observaciones || "—"}
        </p>
      </div>
    </div>
  );
}
