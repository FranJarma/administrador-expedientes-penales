import { addDays, format, isAfter, startOfDay } from "date-fns";

/**
 * Convierte una fecha "date" de Postgres (string "YYYY-MM-DD") a un Date
 * en medianoche local, evitando el corrimiento de un día por UTC.
 */
export function parseFechaSql(fecha: string): Date {
  return startOfDay(new Date(`${fecha}T00:00:00`));
}

export function formatFechaSql(fecha: Date): string {
  return format(fecha, "yyyy-MM-dd");
}

export function esFinDeSemana(fecha: Date): boolean {
  const dia = fecha.getDay();
  return dia === 0 || dia === 6;
}

export function esDiaHabil(fecha: Date, feriados: Set<string>): boolean {
  return !esFinDeSemana(fecha) && !feriados.has(formatFechaSql(fecha));
}

/** Ajusta una fecha al siguiente día hábil si cae en fin de semana o feriado. */
export function ajustarASiguienteHabil(fecha: Date, feriados: Set<string>): Date {
  let cursor = startOfDay(fecha);
  while (!esDiaHabil(cursor, feriados)) {
    cursor = addDays(cursor, 1);
  }
  return cursor;
}

/**
 * Cuenta los días hábiles estrictamente posteriores a `desde` y hasta
 * `hasta` inclusive. Si `hasta` no es posterior a `desde`, devuelve 0.
 */
export function contarDiasHabilesEntre(
  desde: Date,
  hasta: Date,
  feriados: Set<string>
): number {
  const inicio = startOfDay(desde);
  const fin = startOfDay(hasta);
  if (!isAfter(fin, inicio)) return 0;

  let count = 0;
  let cursor = addDays(inicio, 1);
  while (!isAfter(cursor, fin)) {
    if (esDiaHabil(cursor, feriados)) count++;
    cursor = addDays(cursor, 1);
  }
  return count;
}

export function feriadosASet(feriados: { fecha: string }[]): Set<string> {
  return new Set(feriados.map((f) => f.fecha));
}
