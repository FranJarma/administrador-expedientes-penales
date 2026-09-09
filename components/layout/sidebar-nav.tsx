"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  CalendarDays,
  CalendarRange,
  Clock,
  FolderOpen,
  LayoutDashboard,
  ListChecks,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expedientes", label: "Expedientes", icon: FolderOpen },
  { href: "/plazos", label: "Plazos", icon: Clock },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/tareas", label: "Tareas", icon: ListChecks },
  { href: "/carga-de-trabajo", label: "Carga de trabajo", icon: BarChart3 },
  { href: "/notificaciones", label: "Notificaciones", icon: Bell },
  { href: "/feriados", label: "Feriados", icon: CalendarRange },
];

export function SidebarNav({
  esAdmin,
  horizontal = false,
}: {
  esAdmin: boolean;
  horizontal?: boolean;
}) {
  const pathname = usePathname();

  const items = esAdmin
    ? [...NAV_ITEMS, { href: "/admin", label: "Administración", icon: ShieldCheck }]
    : NAV_ITEMS;

  return (
    <nav className={cn("flex gap-1 p-3", horizontal ? "flex-row" : "flex-col")}>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
