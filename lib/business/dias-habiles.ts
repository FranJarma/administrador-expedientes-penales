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

/**
 * Devuelve el día hábil número `cantidad` contado estrictamente después de
 * `desde` (es decir, `desde` no se cuenta). Ej: desde un viernes, 1 hábil es
 * el lunes siguiente (si no es feriado).
 */
export function sumarDiasHabiles(desde: Date, cantidad: number, feriados: Set<string>): Date {
  let cursor = startOfDay(desde);
  let restantes = cantidad;
  while (restantes > 0) {
    cursor = addDays(cursor, 1);
    if (esDiaHabil(cursor, feriados)) restantes--;
  }
  return cursor;
}

/**
 * Días hábiles que le quedan a un plazo al suspenderlo. El día de la
 * suspensión ya no corre, así que se cuentan los hábiles desde esa fecha
 * (inclusive) hasta el vencimiento (inclusive).
 */
export function diasHabilesRestantesAlSuspender(
  fechaSuspension: Date,
  vencimiento: Date,
  feriados: Set<string>
): number {
  return contarDiasHabilesEntre(addDays(startOfDay(fechaSuspension), -1), vencimiento, feriados);
}

/**
 * Nuevo vencimiento al reanudar un plazo suspendido. El día de la
 * reanudación vuelve a correr, así que es el primer hábil que se cuenta.
 * Los días entre la suspensión y la reanudación no se computan.
 */
export function vencimientoAlReanudar(
  fechaReanudacion: Date,
  diasHabilesRestantes: number,
  feriados: Set<string>
): Date {
  return sumarDiasHabiles(addDays(startOfDay(fechaReanudacion), -1), diasHabilesRestantes, feriados);
}

/**
 * Fechas a cargar como feriado para un rango (ej. la feria judicial): cada
 * día de lunes a viernes entre `desde` y `hasta` inclusive, salvo las que ya
 * estaban cargadas. Si es un solo día se carga aunque caiga en fin de semana.
 */
export function fechasParaCargarFeriados(
  desde: Date,
  hasta: Date,
  yaCargadas: Set<string>
): string[] {
  const inicio = startOfDay(desde);
  const fin = startOfDay(hasta);
  const esRango = isAfter(fin, inicio);
  const fechas: string[] = [];
  for (let dia = inicio; !isAfter(dia, fin); dia = addDays(dia, 1)) {
    const fecha = formatFechaSql(dia);
    if (esRango && esFinDeSemana(dia)) continue;
    if (yaCargadas.has(fecha)) continue;
    fechas.push(fecha);
  }
  return fechas;
}

export function feriadosASet(feriados: { fecha: string }[]): Set<string> {
  return new Set(feriados.map((f) => f.fecha));
}
