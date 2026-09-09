"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { crearInvitaciones } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useServerAction } from "@/hooks/use-server-action";
import type { Invitacion, User } from "@/lib/db/schema";

export function InvitacionesPanel({
  invitaciones,
  usuarios,
}: {
  invitaciones: Invitacion[];
  usuarios: User[];
}) {
  const router = useRouter();
  const [codigosGenerados, setCodigosGenerados] = useState<string[]>([]);
  const { run, isPending } = useServerAction(crearInvitaciones);

  const usuariosPorId = new Map(usuarios.map((u) => [u.id, u]));

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    run({ cantidad: fd.get("cantidad") }, (data) => {
      setCodigosGenerados(data.codigos);
      toast.success(`${data.codigos.length} código(s) generado(s)`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="cantidad">Cantidad de códigos</Label>
          <Input
            id="cantidad"
            name="cantidad"
            type="number"
            min={1}
            max={20}
            defaultValue={1}
            className="w-32"
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Generando..." : "Generar invitaciones"}
        </Button>
      </form>

      {codigosGenerados.length > 0 && (
        <div className="rounded-md border border-success/40 bg-success/10 p-3 text-sm">
          <p className="mb-1 font-medium text-success">Códigos generados:</p>
          <ul className="space-y-0.5 font-mono">
            {codigosGenerados.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Usado por</TableHead>
              <TableHead>Fecha de uso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitaciones.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No hay invitaciones generadas.
                </TableCell>
              </TableRow>
            )}
            {invitaciones.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono text-sm">{inv.codigo}</TableCell>
                <TableCell>
                  <Badge variant={inv.usadoPor ? "secondary" : "success"}>
                    {inv.usadoPor ? "Usada" : "Disponible"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {inv.usadoPor ? (usuariosPorId.get(inv.usadoPor)?.nombre ?? "—") : "—"}
                </TableCell>
                <TableCell>
                  {inv.usadoEn ? new Date(inv.usadoEn).toLocaleDateString("es-AR") : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
