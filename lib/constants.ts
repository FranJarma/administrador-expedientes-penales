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

export const SITUACIONES_PERSONA = ["Libre", "Detenido"] as const;

export const LUGARES_DETENCION = [
  "UC1",
  "UC4",
  "Alcaidía",
  "Domiciliaria",
  "Otro",
] as const;

export const ROLES_PARTE = [
  "Fiscalía",
  "Querella",
  "Actor civil",
  "Demandado civil",
] as const;

export const CATEGORIAS_PLAZO = ["procesal", "prision_preventiva"] as const;

export const CATEGORIA_PLAZO_LABEL: Record<(typeof CATEGORIAS_PLAZO)[number], string> = {
  procesal: "Procesal",
  prision_preventiva: "Prisión preventiva",
};

export const ESTADOS_TAREA = ["Pendiente", "En progreso", "Completada"] as const;

export const ANTICIPACIONES_DEFAULT: Record<string, boolean> = {
  "15": false,
  "7": true,
  "3": true,
  "1": true,
  "0": true,
};

export const ANTICIPACIONES_DIAS = ["15", "7", "3", "1", "0"] as const;
