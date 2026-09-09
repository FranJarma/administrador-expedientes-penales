"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { marcarCumplido } from "@/actions/plazos";
import { Checkbox } from "@/components/ui/checkbox";

export function CumplidoToggle({ id, cumplido }: { id: string; cumplido: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(checked: boolean) {
    startTransition(async () => {
      const result = await marcarCumplido({ id, cumplido: checked });
      if (result.success) {
        toast.success(checked ? "Plazo marcado como cumplido" : "Plazo marcado como pendiente");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <label className="flex items-center gap-1.5 text-xs whitespace-nowrap text-muted-foreground">
      <Checkbox
        checked={cumplido}
        disabled={isPending}
        onCheckedChange={(value) => handleChange(value === true)}
      />
      Cumplido
    </label>
  );
}
