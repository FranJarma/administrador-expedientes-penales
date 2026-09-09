"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { actualizarConfiguracionNotificaciones } from "@/actions/notificaciones";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useServerAction } from "@/hooks/use-server-action";
import { ANTICIPACIONES_DIAS } from "@/lib/constants";

export function NotificacionesForm({
  anticipacionesIniciales,
}: {
  anticipacionesIniciales: Record<string, boolean>;
}) {
  const router = useRouter();
  const [anticipaciones, setAnticipaciones] = useState(anticipacionesIniciales);
  const { run, isPending } = useServerAction(actualizarConfiguracionNotificaciones);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    run({ anticipaciones }, () => {
      toast.success("Configuración de notificaciones guardada");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-5">
      <div>
        <h2 className="text-sm font-medium">Anticipaciones</h2>
        <p className="text-xs text-muted-foreground">
          Elegí con cuántos días hábiles de anticipación querés ver la alerta de un plazo. Los
          plazos vencidos siempre se muestran.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        {ANTICIPACIONES_DIAS.map((dia) => (
          <label key={dia} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={anticipaciones[dia] ?? false}
              onCheckedChange={(value) =>
                setAnticipaciones((prev) => ({ ...prev, [dia]: value === true }))
              }
            />
            {dia === "0" ? "El mismo día" : `${dia} días hábiles antes`}
          </label>
        ))}
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar configuración"}
      </Button>
    </form>
  );
}
