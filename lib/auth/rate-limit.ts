/**
 * Rate limiting básico en memoria para el login, por email. Alcanza para el
 * MVP (1-2 usuarios); en un despliegue multi-instancia esto debería migrar
 * a un store compartido (Redis, tabla en la base, etc.).
 */

const VENTANA_MS = 15 * 60 * 1000;
const MAX_INTENTOS = 5;
const BLOQUEO_MS = 15 * 60 * 1000;

type Entrada = { count: number; primerIntento: number; bloqueadoHasta?: number };

const intentos = new Map<string, Entrada>();

export function checkLoginRateLimit(email: string): {
  permitido: boolean;
  motivo?: string;
} {
  const key = email.trim().toLowerCase();
  const entrada = intentos.get(key);
  if (!entrada) return { permitido: true };

  const ahora = Date.now();

  if (entrada.bloqueadoHasta) {
    if (ahora < entrada.bloqueadoHasta) {
      return {
        permitido: false,
        motivo: "Demasiados intentos fallidos. Intente nuevamente más tarde.",
      };
    }
    intentos.delete(key);
    return { permitido: true };
  }

  if (ahora - entrada.primerIntento > VENTANA_MS) {
    intentos.delete(key);
    return { permitido: true };
  }

  return { permitido: true };
}

export function registrarIntentoLogin(email: string) {
  const key = email.trim().toLowerCase();
  const ahora = Date.now();
  const entrada = intentos.get(key);

  if (!entrada || ahora - entrada.primerIntento > VENTANA_MS) {
    intentos.set(key, { count: 1, primerIntento: ahora });
    return;
  }

  entrada.count += 1;
  if (entrada.count >= MAX_INTENTOS) {
    entrada.bloqueadoHasta = ahora + BLOQUEO_MS;
  }
}

export function resetLoginRateLimit(email: string) {
  intentos.delete(email.trim().toLowerCase());
}
