import type { Plazo } from "@/lib/db/schema";

/** Fecha de vencimiento con el detalle de ampliaciones o suspensión. */
export function VencimientoDetalle({ plazo }: { plazo: Plazo }) {
  if (plazo.suspendidoDesde) {
    return (
      <div className="space-y-0.5">
        <p className="text-muted-foreground line-through">{plazo.fechaVencimiento}</p>
        <p className="text-xs text-muted-foreground">
          Suspendido desde {plazo.suspendidoDesde}
          {plazo.diasHabilesAlSuspender !== null &&
            ` · restan ${plazo.diasHabilesAlSuspender} días hábiles`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <p>{plazo.fechaVencimiento}</p>
      {plazo.ampliaciones > 0 && plazo.fechaVencimientoOriginal && (
        <p className="text-xs text-muted-foreground">
          Original: {plazo.fechaVencimientoOriginal}
        </p>
      )}
    </div>
  );
}
