"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { actualizarPlazo, crearPlazo } from "@/actions/plazos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useServerAction } from "@/hooks/use-server-action";
import { CATEGORIA_PLAZO_LABEL, CATEGORIAS_PLAZO } from "@/lib/constants";
import type { Persona, Plazo } from "@/lib/db/schema";

export function PlazoForm({
  expedienteId,
  personas,
  plazo,
  onSuccess,
}: {
  expedienteId: string;
  personas: Persona[];
  plazo?: Plazo;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [categoria, setCategoria] = useState<string>(plazo?.categoria ?? "procesal");
  const { run, isPending, fieldErrors } = useServerAction(
    plazo ? (input: unknown) => actualizarPlazo(plazo.id, input) : crearPlazo
  );

  const personasDetenidas = personas.filter((p) => p.situacion === "Detenido");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    run(
      {
        expedienteId,
        categoria: fd.get("categoria"),
        personaId: fd.get("personaId") ?? "",
        tipo: fd.get("tipo"),
        descripcion: fd.get("descripcion"),
        fechaInicio: fd.get("fechaInicio"),
        fechaVencimiento: fd.get("fechaVencimiento"),
        responsable: fd.get("responsable"),
        observaciones: fd.get("observaciones"),
      },
      (data) => {
        if (data.seAjusto) {
          toast.info(
            `La fecha de vencimiento cae en fin de semana o feriado: se ajustó automáticamente al ${data.fechaAjustada}.`
          );
        } else {
          toast.success(plazo ? "Plazo actualizado" : "Plazo creado");
        }
        router.refresh();
        onSuccess();
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="categoria">Categoría</Label>
          <Select name="categoria" defaultValue={categoria} onValueChange={setCategoria}>
            <SelectTrigger id="categoria" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIAS_PLAZO.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORIA_PLAZO_LABEL[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tipo">Tipo</Label>
          <Input id="tipo" name="tipo" defaultValue={plazo?.tipo} required />
          {fieldErrors?.tipo && <p className="text-xs text-destructive">{fieldErrors.tipo[0]}</p>}
        </div>
      </div>

      {categoria === "prision_preventiva" && (
        <div className="space-y-1.5">
          <Label htmlFor="personaId">Persona detenida</Label>
          <Select name="personaId" defaultValue={plazo?.personaId ?? undefined}>
            <SelectTrigger id="personaId" className="w-full">
              <SelectValue placeholder="Seleccionar persona..." />
            </SelectTrigger>
            <SelectContent>
              {personasDetenidas.length === 0 && (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No hay personas detenidas cargadas
                </div>
              )}
              {personasDetenidas.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors?.personaId && (
            <p className="text-xs text-destructive">{fieldErrors.personaId[0]}</p>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea id="descripcion" name="descripcion" defaultValue={plazo?.descripcion ?? ""} rows={2} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="fechaInicio">Fecha de inicio</Label>
          <Input
            id="fechaInicio"
            name="fechaInicio"
            type="date"
            defaultValue={plazo?.fechaInicio}
            required
          />
          {fieldErrors?.fechaInicio && (
            <p className="text-xs text-destructive">{fieldErrors.fechaInicio[0]}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fechaVencimiento">Fecha de vencimiento</Label>
          <Input
            id="fechaVencimiento"
            name="fechaVencimiento"
            type="date"
            defaultValue={plazo?.fechaVencimiento}
            required
          />
          {fieldErrors?.fechaVencimiento && (
            <p className="text-xs text-destructive">{fieldErrors.fechaVencimiento[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="responsable">Responsable</Label>
        <Input id="responsable" name="responsable" defaultValue={plazo?.responsable} required />
        {fieldErrors?.responsable && (
          <p className="text-xs text-destructive">{fieldErrors.responsable[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea
          id="observaciones"
          name="observaciones"
          defaultValue={plazo?.observaciones ?? ""}
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Guardando..." : plazo ? "Guardar cambios" : "Crear plazo"}
      </Button>
    </form>
  );
}
