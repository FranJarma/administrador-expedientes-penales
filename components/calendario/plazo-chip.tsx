import Link from "next/link";
import { Check, Gavel } from "lucide-react";

import { cn } from "@/lib/utils";
import type { EstadoSemaforo } from "@/lib/business/semaforo";

const SEMAFORO_DOT: Record<EstadoSemaforo, string> = {
  vencido: "bg-urgente",
  urgente: "bg-urgente",
  proximo: "bg-warning",
  lejano: "bg-success",
  cumplido: "bg-muted-foreground",
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
        tieneDetenido
          ? "border-urgente/40 bg-urgente/10 text-urgente"
          : "border-success/40 bg-success/10 text-success"
      )}
      title={
        props.kind === "audiencia"
          ? `${numero} — Audiencia: ${tipo}${props.hora ? ` (${props.hora})` : ""}`
          : `${numero} — ${tipo}`
      }
    >
      {props.kind === "audiencia" ? (
        <Gavel className="size-3 shrink-0" />
      ) : props.cumplido ? (
        <Check className="size-3 shrink-0" />
      ) : (
        <span className={cn("size-2 shrink-0 rounded-full", SEMAFORO_DOT[props.estado])} />
      )}
      <span className="truncate">
        {numero} · {props.kind === "audiencia" && props.hora ? `${props.hora} ` : ""}
        {tipo}
      </span>
    </Link>
  );
}
