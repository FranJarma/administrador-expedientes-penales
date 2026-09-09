"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { eliminarPlazo } from "@/actions/plazos";
import { DeleteButton } from "@/components/forms/delete-button";
import { CumplidoToggle } from "@/components/plazos/cumplido-toggle";
import { SemaforoBadge } from "@/components/plazos/semaforo-badge";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CATEGORIA_PLAZO_LABEL } from "@/lib/constants";
import type { PlazoEnriquecido } from "@/lib/business/plazos-view";

const ESTADOS_FILTRO = [
  { value: "todos", label: "Todos los estados" },
  { value: "activos", label: "Activos (no cumplidos)" },
  { value: "vencenHoy", label: "Vencen hoy" },
  { value: "vencido", label: "Vencidos" },
  { value: "urgente", label: "Urgentes (≤3 hábiles)" },
  { value: "proximo", label: "Próximos (≤7 hábiles)" },
  { value: "lejano", label: "Lejanos" },
  { value: "cumplido", label: "Cumplidos" },
];

export function PlazosList({
  plazos,
  categoriaInicial,
  estadoInicial,
}: {
  plazos: PlazoEnriquecido[];
  categoriaInicial: string;
  estadoInicial: string;
}) {
  const [categoria, setCategoria] = useState(categoriaInicial);
  const [estado, setEstado] = useState(estadoInicial);
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return plazos.filter((item) => {
      const coincideCategoria = categoria === "todos" || item.plazo.categoria === categoria;
      const coincideEstado =
        estado === "todos" ||
        (estado === "vencenHoy" && item.vencimientoHoy) ||
        (estado === "activos" && !item.plazo.cumplido) ||
        item.estado === estado;
      const coincideTexto =
        !texto ||
        item.plazo.tipo.toLowerCase().includes(texto) ||
        item.expediente.numero.toLowerCase().includes(texto) ||
        item.expediente.caratula.toLowerCase().includes(texto) ||
        item.plazo.responsable.toLowerCase().includes(texto) ||
        (item.persona?.nombre.toLowerCase().includes(texto) ?? false);
      return coincideCategoria && coincideEstado && coincideTexto;
    });
  }, [plazos, categoria, estado, busqueda]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Buscar por expediente, tipo, responsable o persona..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={categoria} onValueChange={setCategoria}>
          <SelectTrigger className="sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas las categorías</SelectItem>
            <SelectItem value="procesal">Procesal</SelectItem>
            <SelectItem value="prision_preventiva">Prisión preventiva</SelectItem>
          </SelectContent>
        </Select>
        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger className="sm:w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ESTADOS_FILTRO.map((e) => (
              <SelectItem key={e.value} value={e.value}>
                {e.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Expediente</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Persona</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No se encontraron plazos.
                </TableCell>
              </TableRow>
            )}
            {filtrados.map((item) => (
              <TableRow key={item.plazo.id}>
                <TableCell>
                  <Link
                    href={`/expedientes/${item.expediente.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {item.expediente.numero}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={item.plazo.categoria === "prision_preventiva" ? "urgente" : "outline"}>
                    {CATEGORIA_PLAZO_LABEL[item.plazo.categoria]}
                  </Badge>
                </TableCell>
                <TableCell>{item.plazo.tipo}</TableCell>
                <TableCell>{item.persona?.nombre ?? "—"}</TableCell>
                <TableCell>{item.plazo.fechaVencimiento}</TableCell>
                <TableCell>
                  <SemaforoBadge estado={item.estado} />
                </TableCell>
                <TableCell>{item.plazo.responsable}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <CumplidoToggle id={item.plazo.id} cumplido={item.plazo.cumplido} />
                    <DeleteButton
                      action={() => eliminarPlazo(item.plazo.id)}
                      confirmMessage="¿Eliminar este plazo?"
                      successMessage="Plazo eliminado"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
