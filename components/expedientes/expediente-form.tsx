"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { actualizarExpediente, crearExpediente } from "@/actions/expedientes";
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
import { TextareaConTab } from "@/components/forms/textarea-con-tab";
import { useServerAction } from "@/hooks/use-server-action";
import { ESTADOS_EXPEDIENTE, MAX_NOTA_EXPEDIENTE, TIPOS_EXPEDIENTE } from "@/lib/constants";
import type { Expediente } from "@/lib/db/schema";

// Radix Select no admite un valor vacío, así que "sin especificar" usa un centinela.
const SIN_TIPO = "sin_especificar";

export function ExpedienteForm({
  expediente,
  onSuccess,
}: {
  expediente?: Expediente;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const { run, isPending, fieldErrors } = useServerAction(
    expediente
      ? (input: unknown) => actualizarExpediente(expediente.id, input)
      : crearExpediente
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    run(
      {
        numero: fd.get("numero"),
        caratula: fd.get("caratula"),
        estado: fd.get("estado"),
        tipo: fd.get("tipo") === SIN_TIPO ? "" : (fd.get("tipo") ?? ""),
        fechaInicio: fd.get("fechaInicio"),
        nota: fd.get("nota"),
        observaciones: fd.get("observaciones"),
      },
      () => {
        toast.success(expediente ? "Expediente actualizado" : "Expediente creado");
        router.refresh();
        onSuccess();
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="numero">Número</Label>
        <Input id="numero" name="numero" defaultValue={expediente?.numero} required />
        {fieldErrors?.numero && (
          <p className="text-xs text-destructive">{fieldErrors.numero[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="caratula">Carátula</Label>
        <Input id="caratula" name="caratula" defaultValue={expediente?.caratula} required />
        {fieldErrors?.caratula && (
          <p className="text-xs text-destructive">{fieldErrors.caratula[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="estado">Estado</Label>
          <Select name="estado" defaultValue={expediente?.estado ?? ESTADOS_EXPEDIENTE[0]}>
            <SelectTrigger id="estado" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS_EXPEDIENTE.map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {estado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tipo">Tipo de expediente</Label>
          <Select name="tipo" defaultValue={expediente?.tipo ?? SIN_TIPO}>
            <SelectTrigger id="tipo" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SIN_TIPO}>Sin especificar</SelectItem>
              {TIPOS_EXPEDIENTE.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fechaInicio">Fecha de inicio</Label>
        <Input
          id="fechaInicio"
          name="fechaInicio"
          type="date"
          defaultValue={expediente?.fechaInicio}
          required
        />
        {fieldErrors?.fechaInicio && (
          <p className="text-xs text-destructive">{fieldErrors.fechaInicio[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nota">Observaciones</Label>
        <Input
          id="nota"
          name="nota"
          defaultValue={expediente?.nota ?? ""}
          maxLength={MAX_NOTA_EXPEDIENTE}
          placeholder="Esperando pericia"
        />
        <p className="text-xs text-muted-foreground">
          Nota corta que se ve en la planilla de expedientes.
        </p>
        {fieldErrors?.nota && <p className="text-xs text-destructive">{fieldErrors.nota[0]}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="observaciones">Síntesis</Label>
        <TextareaConTab
          id="observaciones"
          name="observaciones"
          defaultValue={expediente?.observaciones ?? ""}
          rows={10}
          className="min-h-40 resize-y"
        />
        <p className="text-xs text-muted-foreground">
          Enter separa párrafos y Tab agrega sangría.
        </p>
        {fieldErrors?.observaciones && (
          <p className="text-xs text-destructive">{fieldErrors.observaciones[0]}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Guardando..." : expediente ? "Guardar cambios" : "Crear expediente"}
      </Button>
    </form>
  );
}
