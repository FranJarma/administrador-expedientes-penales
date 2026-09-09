import { Badge } from "@/components/ui/badge";
import {
  ESTADO_SEMAFORO_BADGE_VARIANT,
  ESTADO_SEMAFORO_LABEL,
  type EstadoSemaforo,
} from "@/lib/business/semaforo";

export function SemaforoBadge({ estado }: { estado: EstadoSemaforo }) {
  return (
    <Badge variant={ESTADO_SEMAFORO_BADGE_VARIANT[estado]}>
      {ESTADO_SEMAFORO_LABEL[estado]}
    </Badge>
  );
}
