"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { actualizarAudiencia, crearAudiencia } from "@/actions/audiencias";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useServerAction } from "@/hooks/use-server-action";
import type { Audiencia } from "@/lib/db/schema";

export function AudienciaForm({
  expedienteId,
  audiencia,
  onSuccess,
}: {
  expedienteId: string;
  audiencia?: Audiencia;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const { run, isPending, fieldErrors } = useServerAction(
    audiencia
      ? (input: unknown) => actualizarAudiencia(audiencia.id, input)
      : crearAudiencia
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    run(
      {
        expedienteId,
        fecha: fd.get("fecha"),
        hora: fd.get("hora"),
        tipo: fd.get("tipo"),
        lugar: fd.get("lugar"),
        observaciones: fd.get("observaciones"),
      },
      () => {
        toast.success(audiencia ? "Audiencia actualizada" : "Audiencia creada");
        router.refresh();
        onSuccess();
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="tipo">Tipo de audiencia</Label>
        <Input
          id="tipo"
          name="tipo"
          placeholder="Ej: Audiencia de debate"
          defaultValue={audiencia?.tipo}
          required
        />
        {fieldErrors?.tipo && <p className="text-xs text-destructive">{fieldErrors.tipo[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="fecha">Fecha</Label>
          <Input id="fecha" name="fecha" type="date" defaultValue={audiencia?.fecha} required />
          {fieldErrors?.fecha && <p className="text-xs text-destructive">{fieldErrors.fecha[0]}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hora">Hora</Label>
          <Input
            id="hora"
            name="hora"
            type="time"
            defaultValue={audiencia?.hora?.slice(0, 5) ?? ""}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lugar">Lugar</Label>
        <Input id="lugar" name="lugar" defaultValue={audiencia?.lugar ?? ""} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea
          id="observaciones"
          name="observaciones"
          defaultValue={audiencia?.observaciones ?? ""}
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Guardando..." : audiencia ? "Guardar cambios" : "Agregar audiencia"}
      </Button>
    </form>
  );
}
