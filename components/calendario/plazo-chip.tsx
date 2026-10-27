import Link from "next/link";
import { Check, Gavel, User } from "lucide-react";

import { ESTILO_CLASE } from "@/components/calendario/estilos-clase";
import type { EstadoSemaforo } from "@/lib/business/semaforo";
import type { ClaseAudiencia } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SEMAFORO_DOT: Record<EstadoSemaforo, string> = {
  vencido: "bg-urgente",
  urgente: "bg-urgente",
  proximo: "bg-warning",
  lejano: "bg-success",
  cumplido: "bg-muted-foreground",
  suspendido: "bg-muted-foreground",
};

type EventoChipProps =
  | {
      kind: "plazo";
      expedienteId: string;
      numero: string;
      tipo: string;
      estado: EstadoSemaforo;
      tieneDetenido: boolean;
      cumplido: boolean;
    }
  | {
      kind: "audiencia";
      clase: ClaseAudiencia;
      expedienteId: string;
      numero: string;
      tipo: string;
      hora?: string | null;
      tieneDetenido: boolean;
    };

export function EventoChip(props: EventoChipProps) {
  const { expedienteId, numero, tipo, tieneDetenido } = props;

  return (
    <Link
      href={`/expedientes/${expedienteId}`}
      className={cn(
        "flex items-center gap-1.5 rounded border px-1.5 py-1 text-[11px] leading-tight hover:opacity-80",
        // Audiencias y citaciones se distinguen por color; los plazos siguen
        // marcando si el expediente tiene una persona detenida.
        props.kind === "audiencia"
          ? ESTILO_CLASE[props.clase].chip
          : tieneDetenido
            ? "border-urgente/40 bg-urgente/10 text-urgente"
            : "border-success/40 bg-success/10 text-success"
      )}
      title={
        props.kind === "audiencia"
          ? `${numero} — ${props.clase}: ${tipo}${props.hora ? ` (${props.hora})` : ""}${tieneDetenido ? " — con persona detenida" : ""}`
          : `${numero} — ${tipo}`
      }
    >
      {props.kind === "audiencia" ? (
        props.clase === "Citación" ? (
          <User className="size-3 shrink-0" />
        ) : (
          <Gavel className="size-3 shrink-0" />
        )
      ) : props.cumplido ? (
        <Check className="size-3 shrink-0" />
      ) : (
        <span className={cn("size-2 shrink-0 rounded-full", SEMAFORO_DOT[props.estado])} />
      )}
      <span className="truncate">
        {numero} · {props.kind === "audiencia" && props.hora ? `${props.hora} ` : ""}
        {tipo}
      </span>
      {props.kind === "audiencia" && tieneDetenido && (
        <span
          className="ml-auto size-1.5 shrink-0 rounded-full bg-urgente"
          aria-label="Con persona detenida"
        />
      )}
    </Link>
  );
}
