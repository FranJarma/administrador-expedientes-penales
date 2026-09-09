"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { actualizarTarea, crearTarea } from "@/actions/tareas";
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
import { ESTADOS_TAREA } from "@/lib/constants";
import type { Persona, Tarea } from "@/lib/db/schema";

export function TareaForm({
  expedienteId,
  personas,
  tarea,
  onSuccess,
}: {
  expedienteId: string;
  personas: Persona[];
  tarea?: Tarea;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const { run, isPending, fieldErrors } = useServerAction(
    tarea ? (input: unknown) => actualizarTarea(tarea.id, input) : crearTarea
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const personaId = fd.get("personaId");
    run(
      {
        expedienteId,
        personaId: personaId === "__ninguna__" ? "" : personaId,
        titulo: fd.get("titulo"),
        descripcion: fd.get("descripcion"),
        responsable: fd.get("responsable"),
        fechaLimite: fd.get("fechaLimite"),
        estado: fd.get("estado"),
      },
      () => {
        toast.success(tarea ? "Tarea actualizada" : "Tarea creada");
        router.refresh();
        onSuccess();
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="titulo">Título</Label>
        <Input id="titulo" name="titulo" defaultValue={tarea?.titulo} required />
        {fieldErrors?.titulo && <p className="text-xs text-destructive">{fieldErrors.titulo[0]}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea id="descripcion" name="descripcion" defaultValue={tarea?.descripcion ?? ""} rows={2} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="responsable">Responsable</Label>
          <Input id="responsable" name="responsable" defaultValue={tarea?.responsable} required />
          {fieldErrors?.responsable && (
            <p className="text-xs text-destructive">{fieldErrors.responsable[0]}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fechaLimite">Fecha límite</Label>
          <Input
            id="fechaLimite"
            name="fechaLimite"
            type="date"
            defaultValue={tarea?.fechaLimite}
            required
          />
          {fieldErrors?.fechaLimite && (
            <p className="text-xs text-destructive">{fieldErrors.fechaLimite[0]}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="personaId">Persona vinculada</Label>
          <Select name="personaId" defaultValue={tarea?.personaId ?? "__ninguna__"}>
            <SelectTrigger id="personaId" className="w-full">
              <SelectValue placeholder="Sin vincular" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ninguna__">Sin vincular</SelectItem>
              {personas.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="estado">Estado</Label>
          <Select name="estado" defaultValue={tarea?.estado ?? "Pendiente"}>
            <SelectTrigger id="estado" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS_TAREA.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Guardando..." : tarea ? "Guardar cambios" : "Crear tarea"}
      </Button>
    </form>
  );
}
