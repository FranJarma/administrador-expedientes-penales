"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { crearFeriado } from "@/actions/feriados";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useServerAction } from "@/hooks/use-server-action";

export function FeriadoForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter();
  const { run, isPending, fieldErrors } = useServerAction(crearFeriado);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    run(
      { fecha: fd.get("fecha"), hasta: fd.get("hasta"), nombre: fd.get("nombre") },
      (data) => {
        toast.success(
          data.cantidad === 1 ? "Feriado agregado" : `${data.cantidad} días agregados como feriados`
        );
        router.refresh();
        onSuccess();
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="fecha">Fecha</Label>
          <Input id="fecha" name="fecha" type="date" required />
          {fieldErrors?.fecha && <p className="text-xs text-destructive">{fieldErrors.fecha[0]}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hasta">Hasta (opcional)</Label>
          <Input id="hasta" name="hasta" type="date" />
          {fieldErrors?.hasta && <p className="text-xs text-destructive">{fieldErrors.hasta[0]}</p>}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Para cargar la feria judicial completá &quot;Hasta&quot;: se agrega cada día de lunes a
        viernes del rango.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" name="nombre" required />
        {fieldErrors?.nombre && <p className="text-xs text-destructive">{fieldErrors.nombre[0]}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Guardando..." : "Agregar feriado"}
      </Button>
    </form>
  );
}
