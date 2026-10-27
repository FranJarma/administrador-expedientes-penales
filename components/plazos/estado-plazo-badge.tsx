import { Pause } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  ESTADO_SEMAFORO_BADGE_VARIANT,
  ESTADO_SEMAFORO_LABEL,
  type EstadoSemaforo,
} from "@/lib/business/semaforo";

/**
 * Estado del plazo: urgente, próximo, lejano, vencido, cumplido o suspendido.
 * Si el plazo se amplió, se agrega una etiqueta "Ampliado" al lado.
 */
export function EstadoPlazoBadge({
  estado,
  ampliaciones,
}: {
  estado: EstadoSemaforo;
  ampliaciones: number;
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <Badge variant={ESTADO_SEMAFORO_BADGE_VARIANT[estado]}>
        {estado === "suspendido" && <Pause />}
        {ESTADO_SEMAFORO_LABEL[estado]}
      </Badge>
      {ampliaciones > 0 && (
        <Badge variant="outline">
          Ampliado{ampliaciones > 1 ? ` ×${ampliaciones}` : ""}
        </Badge>
      )}
    </span>
  );
}
