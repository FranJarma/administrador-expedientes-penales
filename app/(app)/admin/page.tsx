import { redirect } from "next/navigation";

import { InvitacionesPanel } from "@/components/admin/invitaciones-panel";
import { UsuariosTable } from "@/components/admin/usuarios-table";
import { auth } from "@/lib/auth/config";
import { listarInvitaciones, listarUsuarios } from "@/lib/db/queries/usuarios";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.rol !== "admin") redirect("/dashboard");
  const adminId = session.user.id;

  const [invitaciones, usuarios] = await Promise.all([
    listarInvitaciones(),
    listarUsuarios(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Administración</h1>
        <p className="text-sm text-muted-foreground">
          Gestioná códigos de invitación y usuarios de la plataforma.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Invitaciones</h2>
        <InvitacionesPanel invitaciones={invitaciones} usuarios={usuarios} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Usuarios</h2>
        <UsuariosTable usuarios={usuarios} usuarioActualId={adminId} />
      </section>
    </div>
  );
}
