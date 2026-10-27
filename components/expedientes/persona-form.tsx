"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { actualizarPersona, crearPersona } from "@/actions/personas";
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
import { LUGARES_DETENCION, ROLES_PERSONA, SITUACIONES_PERSONA } from "@/lib/constants";
import type { Persona } from "@/lib/db/schema";

export function PersonaForm({
  expedienteId,
  persona,
  rolInicial,
  onSuccess,
}: {
  expedienteId: string;
  persona?: Persona;
  rolInicial?: (typeof ROLES_PERSONA)[number];
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [rol, setRol] = useState<string>(persona?.rol ?? rolInicial ?? "Imputado");
  const [situacion, setSituacion] = useState<string>(persona?.situacion ?? "Libre");
  const esVictima = rol === "Víctima";
  const { run, isPending, fieldErrors } = useServerAction(
    persona ? (input: unknown) => actualizarPersona(persona.id, input) : crearPersona
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    run(
      {
        expedienteId,
        rol,
        nombre: fd.get("nombre"),
        situacion: esVictima ? undefined : fd.get("situacion"),
        lugarDetencion: esVictima ? "" : (fd.get("lugarDetencion") ?? ""),
        defensor: fd.get("defensor"),
        observaciones: fd.get("observaciones"),
      },
      () => {
        toast.success(persona ? "Persona actualizada" : "Persona agregada");
        router.refresh();
        onSuccess();
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="rol">Rol</Label>
        <Select value={rol} onValueChange={setRol}>
          <SelectTrigger id="rol" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES_PERSONA.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" name="nombre" defaultValue={persona?.nombre} required />
        {fieldErrors?.nombre && <p className="text-xs text-destructive">{fieldErrors.nombre[0]}</p>}
      </div>

      {!esVictima && (
        <div className="space-y-1.5">
          <Label htmlFor="situacion">Situación</Label>
          <Select name="situacion" defaultValue={situacion} onValueChange={setSituacion}>
            <SelectTrigger id="situacion" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SITUACIONES_PERSONA.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {!esVictima && situacion === "Detenido" && (
        <div className="space-y-1.5">
          <Label htmlFor="lugarDetencion">Lugar de detención</Label>
          <Select name="lugarDetencion" defaultValue={persona?.lugarDetencion ?? undefined}>
            <SelectTrigger id="lugarDetencion" className="w-full">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {LUGARES_DETENCION.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors?.lugarDetencion && (
            <p className="text-xs text-destructive">{fieldErrors.lugarDetencion[0]}</p>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="defensor">{esVictima ? "Abogado/a o representante" : "Defensor"}</Label>
        <Input id="defensor" name="defensor" defaultValue={persona?.defensor ?? ""} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea
          id="observaciones"
          name="observaciones"
          defaultValue={persona?.observaciones ?? ""}
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending
          ? "Guardando..."
          : persona
            ? "Guardar cambios"
            : esVictima
              ? "Agregar víctima"
              : "Agregar persona"}
      </Button>
    </form>
  );
}
