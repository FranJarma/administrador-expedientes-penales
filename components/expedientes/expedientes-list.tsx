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
import { ESTADOS_EXPEDIENTE } from "@/lib/constants";
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
  const [condicion, setCondicion] = useState<FiltroCondicion>("todas");

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return expedientes.filter((e) => {
      const coincideTexto =
        !texto ||
        e.numero.toLowerCase().includes(texto) ||
        e.caratula.toLowerCase().includes(texto) ||
        e.responsable.toLowerCase().includes(texto);
      const coincideEstado = estado === "todos" || e.estado === estado;
      const tieneDetenido = detenidosSet.has(e.id);
      const coincideCondicion =
        condicion === "todas" ||
        (condicion === "con_detenido" && tieneDetenido) ||
        (condicion === "sin_detenido" && !tieneDetenido);
      return coincideTexto && coincideEstado && coincideCondicion;
    });
  }, [expedientes, busqueda, estado, condicion, detenidosSet]);

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
            placeholder="Buscar por número, carátula o responsable..."
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
        </div>

        <FormDialog
          trigger={
            <Button>
              <Plus />
              Nuevo expediente
            </Button>
          }
          title="Nuevo expediente"
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
              <TableHead>Condición</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
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
                <TableCell>
                  <Badge variant={detenidosSet.has(expediente.id) ? "urgente" : "secondary"}>
                    {detenidosSet.has(expediente.id) ? "Detenido" : "Libre"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{expediente.estado}</Badge>
                </TableCell>
                <TableCell>{expediente.responsable}</TableCell>
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
