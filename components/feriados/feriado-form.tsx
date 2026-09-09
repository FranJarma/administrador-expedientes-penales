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
      { fecha: fd.get("fecha"), nombre: fd.get("nombre") },
      () => {
        toast.success("Feriado agregado");
        router.refresh();
        onSuccess();
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="fecha">Fecha</Label>
        <Input id="fecha" name="fecha" type="date" required />
        {fieldErrors?.fecha && <p className="text-xs text-destructive">{fieldErrors.fecha[0]}</p>}
      </div>
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
