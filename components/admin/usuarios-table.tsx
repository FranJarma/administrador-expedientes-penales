"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { reactivarUsuario, revocarUsuario } from "@/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { User } from "@/lib/db/schema";

export function UsuariosTable({
  usuarios,
  usuarioActualId,
}: {
  usuarios: User[];
  usuarioActualId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggle(usuario: User) {
    startTransition(async () => {
      const result = usuario.activo
        ? await revocarUsuario(usuario.id)
        : await reactivarUsuario(usuario.id);
      if (result.success) {
        toast.success(usuario.activo ? "Usuario revocado" : "Usuario reactivado");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.map((usuario) => (
            <TableRow key={usuario.id}>
              <TableCell className="font-medium">{usuario.nombre}</TableCell>
              <TableCell>{usuario.email}</TableCell>
              <TableCell>
                <Badge variant="outline">{usuario.rol === "admin" ? "Administrador" : "Usuario"}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={usuario.activo ? "success" : "secondary"}>
                  {usuario.activo ? "Activo" : "Revocado"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending || usuario.id === usuarioActualId}
                  onClick={() => toggle(usuario)}
                >
                  {usuario.activo ? "Revocar" : "Reactivar"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
