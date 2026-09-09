import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/config";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { Toaster } from "@/components/ui/sonner";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const esAdmin = session.user.rol === "admin";

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col">
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <span className="text-sm font-semibold">Expedientes Penales</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav esAdmin={esAdmin} />
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 md:px-6">
          <div className="text-sm font-semibold md:hidden">Expedientes Penales</div>
          <div className="ml-auto">
            <UserMenu
              nombre={session.user.name ?? session.user.email ?? "Usuario"}
              email={session.user.email ?? ""}
              rol={session.user.rol}
            />
          </div>
        </header>
        <div className="overflow-x-auto border-b bg-sidebar md:hidden">
          <SidebarNav esAdmin={esAdmin} horizontal />
        </div>
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-6">{children}</main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
