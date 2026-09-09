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
import { Textarea } from "@/components/ui/textarea";
import { useServerAction } from "@/hooks/use-server-action";
import { ESTADOS_EXPEDIENTE } from "@/lib/constants";
import type { Expediente } from "@/lib/db/schema";

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
        fuero: fd.get("fuero"),
        estado: fd.get("estado"),
        responsable: fd.get("responsable"),
        fechaInicio: fd.get("fechaInicio"),
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="numero">Número</Label>
          <Input id="numero" name="numero" defaultValue={expediente?.numero} required />
          {fieldErrors?.numero && (
            <p className="text-xs text-destructive">{fieldErrors.numero[0]}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fuero">Fuero</Label>
          <Input id="fuero" name="fuero" defaultValue={expediente?.fuero} required />
          {fieldErrors?.fuero && (
            <p className="text-xs text-destructive">{fieldErrors.fuero[0]}</p>
          )}
        </div>
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
          <Label htmlFor="responsable">Responsable</Label>
          <Input id="responsable" name="responsable" defaultValue={expediente?.responsable} required />
          {fieldErrors?.responsable && (
            <p className="text-xs text-destructive">{fieldErrors.responsable[0]}</p>
          )}
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
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea
          id="observaciones"
          name="observaciones"
          defaultValue={expediente?.observaciones ?? ""}
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Guardando..." : expediente ? "Guardar cambios" : "Crear expediente"}
      </Button>
    </form>
  );
}
