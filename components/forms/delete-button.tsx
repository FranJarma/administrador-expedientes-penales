"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function DeleteButton({
  action,
  confirmMessage = "¿Confirma que desea eliminar este registro?",
  successMessage = "Registro eliminado",
}: {
  action: () => Promise<{ success: boolean; error?: string }>;
  confirmMessage?: string;
  successMessage?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        toast.success(successMessage);
        router.refresh();
      } else {
        toast.error(result.error ?? "No se pudo eliminar");
      }
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      disabled={isPending}
      onClick={handleClick}
    >
      <Trash2 className="size-4" />
      <span className="sr-only">Eliminar</span>
    </Button>
  );
}
