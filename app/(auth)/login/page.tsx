import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; registrado?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl =
    typeof params.callbackUrl === "string" && params.callbackUrl.startsWith("/")
      ? params.callbackUrl
      : "/dashboard";

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <CardTitle className="text-lg">Administrador de Expedientes Penales</CardTitle>
        <CardDescription>Ingresá con tu email y contraseña</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {params.registrado && (
          <p className="rounded-md bg-success/15 px-3 py-2 text-sm text-success">
            Cuenta creada correctamente. Ya podés iniciar sesión.
          </p>
        )}
        <LoginForm callbackUrl={callbackUrl} />
        <p className="text-center text-sm text-muted-foreground">
          ¿Tenés un código de invitación?{" "}
          <Link href="/registro" className="font-medium text-primary underline-offset-4 hover:underline">
            Registrate
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
