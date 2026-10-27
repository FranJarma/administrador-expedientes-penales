import { Pause } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  calcularEstadoPlazo,
  ESTADO_PLAZO_LABEL,
  ESTADO_SEMAFORO_BADGE_VARIANT,
  type EstadoSemaforo,
} from "@/lib/business/semaforo";

/**
 * Muestra el estado del plazo (corriendo, ampliado, suspendido, vencido,
 * cumplido). El color sigue el semáforo, así un plazo corriendo o ampliado
 * se ve en rojo/amarillo/verde según lo cerca que esté de vencer.
 */
export function EstadoPlazoBadge({
  estado,
  ampliaciones,
}: {
  estado: EstadoSemaforo;
  ampliaciones: number;
}) {
  const estadoPlazo = calcularEstadoPlazo(estado, ampliaciones);
  return (
    <Badge variant={ESTADO_SEMAFORO_BADGE_VARIANT[estado]}>
      {estadoPlazo === "suspendido" && <Pause />}
      {ESTADO_PLAZO_LABEL[estadoPlazo]}
      {estadoPlazo === "ampliado" && ampliaciones > 1 && ` ×${ampliaciones}`}
    </Badge>
  );
}
