"use client";

import { format } from "date-fns";
import { CalendarPlus, Pause, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { ampliarPlazo, reanudarPlazo, suspenderPlazo } from "@/actions/plazos";
import type { ActionResult } from "@/actions/types";
import { FormDialog } from "@/components/forms/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useServerAction } from "@/hooks/use-server-action";
import { DIAS_AMPLIACION_PLAZO } from "@/lib/constants";
import type { Plazo } from "@/lib/db/schema";

function actionSuccessCliente(mensaje: string): ActionResult<{ mensaje: string }> {
  return { success: true, data: { mensaje } };
}

function hoyLocal() {
  return format(new Date(), "yyyy-MM-dd");
}

/** Botones para ampliar, suspender y reanudar un plazo. */
export function PlazoAcciones({ plazo }: { plazo: Plazo }) {
  if (plazo.cumplido) return null;

  if (plazo.suspendidoDesde) {
    return (
      <FormDialog
        trigger={
          <Button variant="outline" size="sm" title="Reanudar plazo">
            <Play />
            Reanudar
          </Button>
        }
        title="Reanudar plazo"
        description={`Suspendido desde el ${plazo.suspendidoDesde}. Al reanudarlo se cuentan los ${plazo.diasHabilesAlSuspender ?? ""} días hábiles que restaban, empezando por la fecha de reanudación.`}
      >
        {(close) => <FechaForm plazoId={plazo.id} modo="reanudar" onSuccess={close} />}
      </FormDialog>
    );
  }

  // Ampliar y suspender son solo para plazos procesales.
  if (plazo.categoria !== "procesal") return null;

  return (
    <>
      <AmpliarButton plazoId={plazo.id} fechaVencimiento={plazo.fechaVencimiento} />
      <FormDialog
        trigger={
          <Button variant="outline" size="sm" title="Suspender plazo">
            <Pause />
            Suspender
          </Button>
        }
        title="Suspender plazo"
        description="Desde esta fecha el plazo deja de correr. Se guardan los días hábiles que restan para recalcular el vencimiento al reanudarlo."
      >
        {(close) => <FechaForm plazoId={plazo.id} modo="suspender" onSuccess={close} />}
      </FormDialog>
    </>
  );
}

function AmpliarButton({
  plazoId,
  fechaVencimiento,
}: {
  plazoId: string;
  fechaVencimiento: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    const vencido = fechaVencimiento < hoyLocal();
    const pregunta = vencido
      ? `Este plazo ya venció el ${fechaVencimiento}. ¿Ampliarlo igual ${DIAS_AMPLIACION_PLAZO} días hábiles desde esa fecha?`
      : `¿Ampliar este plazo ${DIAS_AMPLIACION_PLAZO} días hábiles a partir del vencimiento actual?`;
    if (!window.confirm(pregunta)) return;
    startTransition(async () => {
      const result = await ampliarPlazo({ id: plazoId });
      if (result.success) {
        toast.success(`Plazo ampliado: nuevo vencimiento ${result.data.fechaVencimiento}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={handleClick}
      title={`Ampliar ${DIAS_AMPLIACION_PLAZO} días hábiles`}
    >
      <CalendarPlus />
      {isPending ? "Ampliando..." : `+${DIAS_AMPLIACION_PLAZO} días`}
    </Button>
  );
}

function FechaForm({
  plazoId,
  modo,
  onSuccess,
}: {
  plazoId: string;
  modo: "suspender" | "reanudar";
  onSuccess: () => void;
}) {
  const router = useRouter();
  const { run, isPending, fieldErrors } = useServerAction(
    async (input: unknown): Promise<ActionResult<{ mensaje: string }>> => {
      if (modo === "suspender") {
        const result = await suspenderPlazo(input);
        if (!result.success) return result;
        return actionSuccessCliente(
          `Plazo suspendido: restan ${result.data.diasHabilesRestantes} días hábiles`
        );
      }
      const result = await reanudarPlazo(input);
      if (!result.success) return result;
      return actionSuccessCliente(
        `Plazo reanudado: nuevo vencimiento ${result.data.fechaVencimiento}`
      );
    }
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    run({ id: plazoId, fecha: fd.get("fecha") }, (data) => {
      toast.success(data.mensaje);
      router.refresh();
      onSuccess();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="fecha">
          {modo === "suspender" ? "Fecha de suspensión" : "Fecha de reanudación"}
        </Label>
        <Input
          id="fecha"
          name="fecha"
          type="date"
          defaultValue={hoyLocal()}
          max={modo === "suspender" ? hoyLocal() : undefined}
          required
        />
        {fieldErrors?.fecha && <p className="text-xs text-destructive">{fieldErrors.fecha[0]}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending
          ? "Guardando..."
          : modo === "suspender"
            ? "Suspender plazo"
            : "Reanudar plazo"}
      </Button>
    </form>
  );
}
