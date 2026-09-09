"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";

import { registroAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type State = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

export function RegistroForm() {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState<State, FormData>(
    async (_prev, formData) => {
      const result = await registroAction({
        nombre: formData.get("nombre"),
        email: formData.get("email"),
        password: formData.get("password"),
        codigoInvitacion: formData.get("codigoInvitacion"),
      });

      if (result.success) {
        router.push("/login?registrado=1");
        return null;
      }

      return { error: result.error, fieldErrors: result.fieldErrors };
    },
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" name="nombre" required autoComplete="name" />
        {state?.fieldErrors?.nombre && (
          <p className="text-xs text-destructive">{state.fieldErrors.nombre[0]}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
        {state?.fieldErrors?.email && (
          <p className="text-xs text-destructive">{state.fieldErrors.email[0]}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        {state?.fieldErrors?.password && (
          <p className="text-xs text-destructive">{state.fieldErrors.password[0]}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="codigoInvitacion">Código de invitación</Label>
        <Input id="codigoInvitacion" name="codigoInvitacion" required />
        {state?.fieldErrors?.codigoInvitacion && (
          <p className="text-xs text-destructive">{state.fieldErrors.codigoInvitacion[0]}</p>
        )}
      </div>
      {state?.error && !state.fieldErrors && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
    </form>
  );
}
