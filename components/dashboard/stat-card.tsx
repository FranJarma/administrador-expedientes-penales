import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  href,
  variant = "default",
}: {
  label: string;
  value: number;
  href: string;
  variant?: "default" | "danger";
}) {
  return (
    <Link href={href}>
      <Card
        className={cn(
          "transition-colors hover:border-primary/50",
          variant === "danger" && "border-urgente/40 bg-urgente/5"
        )}
      >
        <CardContent className="px-5 py-4">
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
