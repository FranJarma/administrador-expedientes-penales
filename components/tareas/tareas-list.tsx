"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { eliminarTarea } from "@/actions/tareas";
import { DeleteButton } from "@/components/forms/delete-button";
import { EstadoTareaSelect } from "@/components/tareas/estado-tarea-select";
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
import { ESTADOS_TAREA } from "@/lib/constants";
import type { TareaConDetalle } from "@/lib/db/queries/tareas";

export function TareasList({
  tareas,
  estadoInicial,
}: {
  tareas: TareaConDetalle[];
  estadoInicial: string;
}) {
  const [estado, setEstado] = useState(estadoInicial);
  const [expedienteId, setExpedienteId] = useState("todos");
  const [personaId, setPersonaId] = useState("todos");
  const [responsable, setResponsable] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const expedientes = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of tareas) map.set(t.expediente.id, t.expediente.numero);
    return Array.from(map.entries());
  }, [tareas]);

  const personas = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of tareas) if (t.persona) map.set(t.persona.id, t.persona.nombre);
    return Array.from(map.entries());
  }, [tareas]);

  const filtradas = useMemo(() => {
    return tareas.filter((t) => {
      const coincideEstado = estado === "todos" || t.tarea.estado === estado;
      const coincideExpediente = expedienteId === "todos" || t.expediente.id === expedienteId;
      const coincidePersona = personaId === "todos" || t.persona?.id === personaId;
      const coincideResponsable =
        !responsable.trim() ||
        t.tarea.responsable.toLowerCase().includes(responsable.trim().toLowerCase());
      const coincideDesde = !desde || t.tarea.fechaLimite >= desde;
      const coincideHasta = !hasta || t.tarea.fechaLimite <= hasta;
      return (
        coincideEstado &&
        coincideExpediente &&
        coincidePersona &&
        coincideResponsable &&
        coincideDesde &&
        coincideHasta
      );
    });
  }, [tareas, estado, expedienteId, personaId, responsable, desde, hasta]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Responsable..."
          value={responsable}
          onChange={(e) => setResponsable(e.target.value)}
          className="w-48"
        />
        <Select value={expedienteId} onValueChange={setExpedienteId}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los expedientes</SelectItem>
            {expedientes.map(([id, numero]) => (
              <SelectItem key={id} value={id}>
                {numero}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={personaId} onValueChange={setPersonaId}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas las personas</SelectItem>
            {personas.map(([id, nombre]) => (
              <SelectItem key={id} value={id}>
                {nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            {ESTADOS_TAREA.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1.5">
          <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="w-40" />
          <span className="text-xs text-muted-foreground">a</span>
          <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="w-40" />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Expediente</TableHead>
              <TableHead>Persona</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Fecha límite</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No se encontraron tareas.
                </TableCell>
              </TableRow>
            )}
            {filtradas.map(({ tarea, expediente, persona }) => (
              <TableRow key={tarea.id}>
                <TableCell className="font-medium">{tarea.titulo}</TableCell>
                <TableCell>
                  <Link
                    href={`/expedientes/${expediente.id}`}
                    className="text-primary hover:underline"
                  >
                    {expediente.numero}
                  </Link>
                </TableCell>
                <TableCell>{persona?.nombre ?? "—"}</TableCell>
                <TableCell>{tarea.responsable}</TableCell>
                <TableCell>{tarea.fechaLimite}</TableCell>
                <TableCell>
                  <EstadoTareaSelect id={tarea.id} estado={tarea.estado} />
                </TableCell>
                <TableCell className="text-right">
                  <DeleteButton
                    action={() => eliminarTarea(tarea.id)}
                    confirmMessage="¿Eliminar esta tarea?"
                    successMessage="Tarea eliminada"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
