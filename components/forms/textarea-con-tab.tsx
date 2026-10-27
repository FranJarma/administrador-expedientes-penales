"use client";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * Textarea para textos largos (síntesis del expediente): la tecla Tab inserta
 * una sangría en vez de pasar al siguiente campo, y Enter separa párrafos.
 */
export function TextareaConTab({
  className,
  onKeyDown,
  ...props
}: React.ComponentProps<typeof Textarea>) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key !== "Tab" || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;

    e.preventDefault();
    const el = e.currentTarget;
    // execCommand conserva el "deshacer" del navegador; si no está
    // disponible, se inserta a mano.
    const insertado =
      typeof document.execCommand === "function" && document.execCommand("insertText", false, "\t");
    if (!insertado) {
      el.setRangeText("\t", el.selectionStart, el.selectionEnd, "end");
    }
  }

  return (
    <Textarea
      className={cn("[tab-size:4]", className)}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}
