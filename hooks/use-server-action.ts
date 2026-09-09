"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export function useServerAction<TInput, TOutput>(
  action: (input: TInput) => Promise<ActionResult<TOutput>>
) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>();

  function run(input: TInput, onSuccess?: (data: TOutput) => void) {
    setError(undefined);
    setFieldErrors(undefined);
    startTransition(async () => {
      const result = await action(input);
      if (result.success) {
        onSuccess?.(result.data);
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors);
        toast.error(result.error);
      }
    });
  }

  return { run, isPending, error, fieldErrors };
}
