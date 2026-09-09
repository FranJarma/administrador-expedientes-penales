import Link from "next/link";

import { RegistroForm } from "@/components/auth/registro-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegistroPage() {
  return (
    <Card>
      <CardHeader className="items-center text-center">
        <CardTitle className="text-lg">Crear cuenta</CardTitle>
        <CardDescription>Necesitás un código de invitación válido</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RegistroForm />
        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Ingresá
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
