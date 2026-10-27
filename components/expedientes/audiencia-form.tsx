"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { actualizarAudiencia, crearAudiencia } from "@/actions/audiencias";
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
import { resultadosPorClase, type ClaseAudiencia } from "@/lib/constants";
import type { Audiencia } from "@/lib/db/schema";

// Radix Select no admite un valor vacío: "sin resultado" usa un centinela.
const SIN_RESULTADO = "sin_resultado";

const TEXTOS: Record<
  ClaseAudiencia,
  { tipo: string; placeholder: string; detalle: string; crear: string; creada: string }
> = {
  Audiencia: {
    tipo: "Tipo de audiencia",
    placeholder: "Ej: Audiencia de debate",
    detalle: "Qué se resolvió, próxima fecha, etc.",
    crear: "Agregar audiencia",
    creada: "Audiencia",
  },
  Citación: {
    tipo: "Persona citada y motivo",
    placeholder: "Ej: Juan Pérez — notificar resolución",
    detalle: "Qué se le notificó, observaciones del acta, etc.",
    crear: "Agregar citación",
    creada: "Citación",
  },
};

export function AudienciaForm({
  expedienteId,
  audiencia,
  clase: claseNueva = "Audiencia",
  onSuccess,
}: {
  expedienteId: string;
  audiencia?: Audiencia;
  /** Clase para un registro nuevo; al editar se usa la del registro. */
  clase?: ClaseAudiencia;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const clase = audiencia?.clase ?? claseNueva;
  const textos = TEXTOS[clase];
  const resultados = resultadosPorClase(clase);
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
        clase,
        fecha: fd.get("fecha"),
        hora: fd.get("hora"),
        tipo: fd.get("tipo"),
        lugar: fd.get("lugar"),
        observaciones: fd.get("observaciones"),
        resultado: fd.get("resultado") === SIN_RESULTADO ? "" : (fd.get("resultado") ?? ""),
        resultadoDetalle: fd.get("resultadoDetalle"),
      },
      () => {
        toast.success(`${textos.creada} ${audiencia ? "actualizada" : "creada"}`);
        router.refresh();
        onSuccess();
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="tipo">{textos.tipo}</Label>
        <Input
          id="tipo"
          name="tipo"
          placeholder={textos.placeholder}
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

      <div className="space-y-1.5">
        <Label htmlFor="resultado">Resultado</Label>
        <Select name="resultado" defaultValue={audiencia?.resultado ?? SIN_RESULTADO}>
          <SelectTrigger id="resultado" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SIN_RESULTADO}>Sin resultado todavía</SelectItem>
            {resultados.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors?.resultado && (
          <p className="text-xs text-destructive">{fieldErrors.resultado[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="resultadoDetalle">Detalle del resultado</Label>
        <Textarea
          id="resultadoDetalle"
          name="resultadoDetalle"
          placeholder={textos.detalle}
          defaultValue={audiencia?.resultadoDetalle ?? ""}
          rows={4}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Guardando..." : audiencia ? "Guardar cambios" : textos.crear}
      </Button>
    </form>
  );
}
