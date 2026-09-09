import { auth } from "@/lib/auth/config";

export class NoAutenticadoError extends Error {
  constructor() {
    super("No autenticado");
  }
}

export class NoAutorizadoError extends Error {
  constructor() {
    super("No autorizado");
  }
}

export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new NoAutenticadoError();
  return session.user.id;
}

export async function requireAdmin(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id || session.user.rol !== "admin") {
    throw new NoAutorizadoError();
  }
  return session.user.id;
}
