"use client";

import { Pencil, Plus } from "lucide-react";

import { eliminarPersona } from "@/actions/personas";
import { DeleteButton } from "@/components/forms/delete-button";
import { FormDialog } from "@/components/forms/form-dialog";
import { PersonaForm } from "@/components/expedientes/persona-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Persona } from "@/lib/db/schema";

export function PersonasTab({
  expedienteId,
  personas,
}: {
  expedienteId: string;
  personas: Persona[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <FormDialog
          trigger={
            <Button size="sm">
              <Plus />
              Agregar persona
            </Button>
          }
          title="Agregar persona"
        >
          {(close) => (
            <PersonaForm expedienteId={expedienteId} onSuccess={close} />
          )}
        </FormDialog>
      </div>

      {personas.length === 0 && (
        <p className="text-sm text-muted-foreground">Todavía no hay personas cargadas.</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {personas.map((persona) => (
          <Card key={persona.id}>
            <CardContent className="space-y-2 px-4 py-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{persona.nombre}</p>
                  <div className="mt-1 flex gap-1.5">
                    <Badge variant={persona.situacion === "Detenido" ? "urgente" : "secondary"}>
                      {persona.situacion}
                    </Badge>
                    {persona.lugarDetencion && (
                      <Badge variant="outline">{persona.lugarDetencion}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <FormDialog
                    trigger={
                      <Button variant="ghost" size="icon">
                        <Pencil className="size-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                    }
                    title="Editar persona"
                  >
                    {(close) => (
                      <PersonaForm
                        expedienteId={expedienteId}
                        persona={persona}
                        onSuccess={close}
                      />
                    )}
                  </FormDialog>
                  <DeleteButton
                    action={() => eliminarPersona(persona.id)}
                    confirmMessage="¿Eliminar esta persona?"
                    successMessage="Persona eliminada"
                  />
                </div>
              </div>
              {persona.defensor && (
                <p className="text-sm text-muted-foreground">Defensor: {persona.defensor}</p>
              )}
              {persona.observaciones && (
                <p className="text-sm text-muted-foreground">{persona.observaciones}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
