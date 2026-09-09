"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PlazoChip } from "@/components/calendario/plazo-chip";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatFechaSql } from "@/lib/business/dias-habiles";
import type { EstadoSemaforo } from "@/lib/business/semaforo";
import { cn } from "@/lib/utils";

export type PlazoCalendario = {
  id: string;
  expedienteId: string;
  numero: string;
  tipo: string;
  fechaVencimiento: string;
  estado: EstadoSemaforo;
  tieneDetenido: boolean;
  cumplido: boolean;
};

type Vista = "mes" | "semana" | "dia";

export function CalendarioView({ plazos }: { plazos: PlazoCalendario[] }) {
  const [vista, setVista] = useState<Vista>("mes");
  const [referencia, setReferencia] = useState(() => new Date());

  const porFecha = useMemo(() => {
    const map = new Map<string, PlazoCalendario[]>();
    for (const p of plazos) {
      const arr = map.get(p.fechaVencimiento) ?? [];
      arr.push(p);
      map.set(p.fechaVencimiento, arr);
    }
    return map;
  }, [plazos]);

  function irAnterior() {
    if (vista === "mes") setReferencia((d) => addMonths(d, -1));
    else if (vista === "semana") setReferencia((d) => addWeeks(d, -1));
    else setReferencia((d) => addDays(d, -1));
  }

  function irSiguiente() {
    if (vista === "mes") setReferencia((d) => addMonths(d, 1));
    else if (vista === "semana") setReferencia((d) => addWeeks(d, 1));
    else setReferencia((d) => addDays(d, 1));
  }

  function irHoy() {
    setReferencia(new Date());
  }

  const dias = useMemo(() => {
    if (vista === "dia") return [referencia];
    if (vista === "semana") {
      const inicio = startOfWeek(referencia, { weekStartsOn: 1 });
      const fin = endOfWeek(referencia, { weekStartsOn: 1 });
      const out: Date[] = [];
      for (let d = inicio; d <= fin; d = addDays(d, 1)) out.push(d);
      return out;
    }
    const inicio = startOfWeek(startOfMonth(referencia), { weekStartsOn: 1 });
    const fin = endOfWeek(endOfMonth(referencia), { weekStartsOn: 1 });
    const out: Date[] = [];
    for (let d = inicio; d <= fin; d = addDays(d, 1)) out.push(d);
    return out;
  }, [vista, referencia]);

  const titulo =
    vista === "mes"
      ? format(referencia, "MMMM yyyy", { locale: es })
      : vista === "semana"
        ? `Semana del ${format(startOfWeek(referencia, { weekStartsOn: 1 }), "d MMM", { locale: es })}`
        : format(referencia, "EEEE d 'de' MMMM yyyy", { locale: es });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={irAnterior}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={irHoy}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={irSiguiente}>
            <ChevronRight className="size-4" />
          </Button>
          <h2 className="ml-2 text-sm font-medium capitalize">{titulo}</h2>
        </div>
        <Tabs value={vista} onValueChange={(v) => setVista(v as Vista)}>
          <TabsList>
            <TabsTrigger value="mes">Mes</TabsTrigger>
            <TabsTrigger value="semana">Semana</TabsTrigger>
            <TabsTrigger value="dia">Día</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border border-urgente/40 bg-urgente/20" />
          Expediente con persona detenida
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border border-success/40 bg-success/20" />
          Sin personas detenidas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-urgente" />
          Urgente / vencido
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-warning" />
          Próximo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-success" />
          Lejano
        </span>
      </div>

      <div
        className={cn(
          "grid gap-px overflow-hidden rounded-lg border bg-border",
          vista === "dia" ? "grid-cols-1" : "grid-cols-7"
        )}
      >
        {vista !== "dia" &&
          ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
            <div key={d} className="bg-muted px-2 py-1.5 text-center text-xs font-medium">
              {d}
            </div>
          ))}
        {dias.map((dia) => {
          const key = formatFechaSql(dia);
          const eventos = porFecha.get(key) ?? [];
          const esHoy = isSameDay(dia, new Date());
          const fueraDeMes = vista === "mes" && !isSameMonth(dia, referencia);
          return (
            <div
              key={key}
              className={cn(
                "min-h-28 bg-card p-1.5",
                vista === "dia" && "min-h-64",
                fueraDeMes && "bg-muted/40 text-muted-foreground"
              )}
            >
              <p
                className={cn(
                  "mb-1 text-xs font-medium",
                  esHoy && "inline-flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                )}
              >
                {format(dia, vista === "dia" ? "d 'de' MMMM" : "d", { locale: es })}
              </p>
              <div className="space-y-1">
                {eventos.map((ev) => (
                  <PlazoChip
                    key={ev.id}
                    expedienteId={ev.expedienteId}
                    numero={ev.numero}
                    tipo={ev.tipo}
                    estado={ev.estado}
                    tieneDetenido={ev.tieneDetenido}
                    cumplido={ev.cumplido}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
