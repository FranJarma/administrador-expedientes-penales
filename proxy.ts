import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";

const RUTAS_PUBLICAS = ["/login", "/registro"];

const proxy = auth((req) => {
  const { nextUrl } = req;
  const estaAutenticado = !!req.auth;
  const esRutaPublica = RUTAS_PUBLICAS.some((ruta) =>
    nextUrl.pathname.startsWith(ruta)
  );

  if (!estaAutenticado && !esRutaPublica) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (estaAutenticado && esRutaPublica) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  return NextResponse.next();
});

export default proxy;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
