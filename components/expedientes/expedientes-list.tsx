"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";

import { eliminarExpediente } from "@/actions/expedientes";
import { DeleteButton } from "@/components/forms/delete-button";
import { FormDialog } from "@/components/forms/form-dialog";
import { ExpedienteForm } from "@/components/expedientes/expediente-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ESTADOS_EXPEDIENTE, TIPOS_EXPEDIENTE } from "@/lib/constants";
import type { Expediente } from "@/lib/db/schema";

type FiltroCondicion = "todas" | "con_detenido" | "sin_detenido";

export function ExpedientesList({
  expedientes,
  expedientesConDetenidos,
}: {
  expedientes: Expediente[];
  expedientesConDetenidos: string[];
}) {
  const detenidosSet = useMemo(
    () => new Set(expedientesConDetenidos),
    [expedientesConDetenidos]
  );

  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<string>("todos");
  const [tipo, setTipo] = useState<string>("todos");
  const [condicion, setCondicion] = useState<FiltroCondicion>("todas");

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return expedientes.filter((e) => {
      const coincideTexto =
        !texto ||
        e.numero.toLowerCase().includes(texto) ||
        e.caratula.toLowerCase().includes(texto) ||
        (e.nota?.toLowerCase().includes(texto) ?? false);
      const coincideEstado = estado === "todos" || e.estado === estado;
      const coincideTipo =
        tipo === "todos" || (tipo === "sin_tipo" ? e.tipo === null : e.tipo === tipo);
      const tieneDetenido = detenidosSet.has(e.id);
      const coincideCondicion =
        condicion === "todas" ||
        (condicion === "con_detenido" && tieneDetenido) ||
        (condicion === "sin_detenido" && !tieneDetenido);
      return coincideTexto && coincideEstado && coincideTipo && coincideCondicion;
    });
  }, [expedientes, busqueda, estado, tipo, condicion, detenidosSet]);

  return (
    <div className="space-y-4">
      <Tabs value={condicion} onValueChange={(v) => setCondicion(v as FiltroCondicion)}>
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="con_detenido">Con preso</TabsTrigger>
          <TabsTrigger value="sin_detenido">Sin preso</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Buscar por número, carátula u observaciones..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="sm:max-w-xs"
          />
          <Select value={estado} onValueChange={setEstado}>
            <SelectTrigger className="sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              {ESTADOS_EXPEDIENTE.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger className="sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              {TIPOS_EXPEDIENTE.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
              <SelectItem value="sin_tipo">Sin tipo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <FormDialog
          trigger={
            <Button>
              <Plus />
              Nuevo expediente
            </Button>
          }
          title="Nuevo expediente"
          className="sm:max-w-2xl"
        >
          {(close) => <ExpedienteForm onSuccess={close} />}
        </FormDialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Carátula</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Condición</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Observaciones</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No se encontraron expedientes.
                </TableCell>
              </TableRow>
            )}
            {filtrados.map((expediente) => (
              <TableRow key={expediente.id}>
                <TableCell>
                  <Link
                    href={`/expedientes/${expediente.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {expediente.numero}
                  </Link>
                </TableCell>
                <TableCell className="max-w-xs truncate">{expediente.caratula}</TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {expediente.tipo ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={detenidosSet.has(expediente.id) ? "urgente" : "secondary"}>
                    {detenidosSet.has(expediente.id) ? "Detenido" : "Libre"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{expediente.estado}</Badge>
                </TableCell>
                <TableCell
                  className="max-w-56 truncate text-muted-foreground"
                  title={expediente.nota ?? undefined}
                >
                  {expediente.nota ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <FormDialog
                      trigger={
                        <Button variant="ghost" size="icon">
                          <Pencil className="size-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      }
                      title="Editar expediente"
                      className="sm:max-w-2xl"
                    >
                      {(close) => (
                        <ExpedienteForm expediente={expediente} onSuccess={close} />
                      )}
                    </FormDialog>
                    <DeleteButton
                      action={() => eliminarExpediente(expediente.id)}
                      confirmMessage="¿Eliminar este expediente? Se eliminarán también sus personas, partes, plazos y tareas."
                      successMessage="Expediente eliminado"
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
