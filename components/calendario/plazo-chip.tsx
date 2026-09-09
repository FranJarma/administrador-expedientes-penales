import Link from "next/link";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { EstadoSemaforo } from "@/lib/business/semaforo";

const SEMAFORO_DOT: Record<EstadoSemaforo, string> = {
  vencido: "bg-urgente",
  urgente: "bg-urgente",
  proximo: "bg-warning",
  lejano: "bg-success",
  cumplido: "bg-muted-foreground",
};

export function PlazoChip({
  expedienteId,
  numero,
  tipo,
  estado,
  tieneDetenido,
  cumplido,
}: {
  expedienteId: string;
  numero: string;
  tipo: string;
  estado: EstadoSemaforo;
  tieneDetenido: boolean;
  cumplido: boolean;
}) {
  return (
    <Link
      href={`/expedientes/${expedienteId}`}
      className={cn(
        "flex items-center gap-1.5 rounded border px-1.5 py-1 text-[11px] leading-tight hover:opacity-80",
        tieneDetenido
          ? "border-urgente/40 bg-urgente/10 text-urgente"
          : "border-success/40 bg-success/10 text-success"
      )}
      title={`${numero} — ${tipo}`}
    >
      {cumplido ? (
        <Check className="size-3 shrink-0" />
      ) : (
        <span className={cn("size-2 shrink-0 rounded-full", SEMAFORO_DOT[estado])} />
      )}
      <span className="truncate">
        {numero} · {tipo}
      </span>
    </Link>
  );
}
