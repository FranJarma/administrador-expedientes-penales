"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { actualizarParte, crearParte } from "@/actions/partes";
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
import { useServerAction } from "@/hooks/use-server-action";
import { ROLES_PARTE } from "@/lib/constants";
import type { Parte } from "@/lib/db/schema";

export function ParteForm({
  expedienteId,
  parte,
  onSuccess,
}: {
  expedienteId: string;
  parte?: Parte;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const { run, isPending, fieldErrors } = useServerAction(
    parte ? (input: unknown) => actualizarParte(parte.id, input) : crearParte
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    run(
      {
        expedienteId,
        rol: fd.get("rol"),
        nombre: fd.get("nombre"),
      },
      () => {
        toast.success(parte ? "Parte actualizada" : "Parte agregada");
        router.refresh();
        onSuccess();
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="rol">Rol</Label>
        <Select name="rol" defaultValue={parte?.rol ?? ROLES_PARTE[0]}>
          <SelectTrigger id="rol" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES_PARTE.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" name="nombre" defaultValue={parte?.nombre} required />
        {fieldErrors?.nombre && <p className="text-xs text-destructive">{fieldErrors.nombre[0]}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Guardando..." : parte ? "Guardar cambios" : "Agregar parte"}
      </Button>
    </form>
  );
}
