export const ROLES_USUARIO = ["admin", "usuario"] as const;

export const ESTADOS_EXPEDIENTE = [
  "En investigación",
  "Acusación formulada",
  "En trámite",
  "A resolución",
  "Elevado a juicio",
  "Demanda civil",
  "Querella",
  "Resuelto",
  "Archivado",
] as const;

export const SITUACIONES_PERSONA = ["Libre", "Detenido", "Rebelde"] as const;

export const ROLES_PERSONA = ["Imputado", "Víctima"] as const;

export const TIPOS_EXPEDIENTE = ["Carpeta judicial", "Expediente físico"] as const;

export const LUGARES_DETENCION = [
  "UC1",
  "UC4",
  "Alcaidía",
  "Domiciliaria",
  "Otro",
] as const;

export const ROLES_PARTE = ["Fiscalía", "Querella", "Defensa", "Asesoría"] as const;

export const CATEGORIAS_PLAZO = ["procesal", "prision_preventiva"] as const;

export const CATEGORIA_PLAZO_LABEL: Record<(typeof CATEGORIAS_PLAZO)[number], string> = {
  procesal: "Procesal",
  prision_preventiva: "Prisión preventiva",
};

/** Días hábiles que suma cada ampliación de plazo. */
export const DIAS_AMPLIACION_PLAZO = 10;

/**
 * Eventos de la agenda de un expediente: audiencias y citaciones (personas
 * citadas para notificarlas y labrar un acta). Se guardan en la misma tabla.
 */
export const CLASES_AUDIENCIA = ["Audiencia", "Citación"] as const;

export type ClaseAudiencia = (typeof CLASES_AUDIENCIA)[number];

export const RESULTADOS_CITACION = ["Notificado/a", "No compareció", "Reprogramada"] as const;

export const RESULTADOS_AUDIENCIA = [
  "Realizada",
  "Suspendida",
  "Cuarto intermedio",
  "Reprogramada",
  "No realizada",
] as const;

/** Opciones de resultado según sea audiencia o citación. */
export function resultadosPorClase(clase: ClaseAudiencia): readonly string[] {
  return clase === "Citación" ? RESULTADOS_CITACION : RESULTADOS_AUDIENCIA;
}

export const ESTADOS_TAREA = ["Pendiente", "En progreso", "Completada"] as const;

export const ANTICIPACIONES_DEFAULT: Record<string, boolean> = {
  "15": false,
  "7": true,
  "3": true,
  "1": true,
  "0": true,
};

export const ANTICIPACIONES_DIAS = ["15", "7", "3", "1", "0"] as const;
