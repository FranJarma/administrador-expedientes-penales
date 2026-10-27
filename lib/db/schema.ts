import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import {
  CATEGORIAS_PLAZO,
  CLASES_AUDIENCIA,
  ESTADOS_EXPEDIENTE,
  ESTADOS_TAREA,
  LUGARES_DETENCION,
  ROLES_PARTE,
  ROLES_PERSONA,
  ROLES_USUARIO,
  SITUACIONES_PERSONA,
  TIPOS_EXPEDIENTE,
} from "@/lib/constants";

export const rolUsuarioEnum = pgEnum("rol_usuario", ROLES_USUARIO);

export const estadoExpedienteEnum = pgEnum("estado_expediente", ESTADOS_EXPEDIENTE);

export const situacionPersonaEnum = pgEnum("situacion_persona", SITUACIONES_PERSONA);

export const rolPersonaEnum = pgEnum("rol_persona", ROLES_PERSONA);

export const tipoExpedienteEnum = pgEnum("tipo_expediente", TIPOS_EXPEDIENTE);

export const lugarDetencionEnum = pgEnum("lugar_detencion", LUGARES_DETENCION);

export const rolParteEnum = pgEnum("rol_parte", ROLES_PARTE);

export const categoriaPlazoEnum = pgEnum("categoria_plazo", CATEGORIAS_PLAZO);

export const estadoTareaEnum = pgEnum("estado_tarea", ESTADOS_TAREA);

export const claseAudienciaEnum = pgEnum("clase_audiencia", CLASES_AUDIENCIA);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: text("nombre").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  rol: rolUsuarioEnum("rol").notNull().default("usuario"),
  plan: text("plan").notNull().default("free"),
  activo: boolean("activo").notNull().default(true),
  creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
});

export const invitaciones = pgTable("invitaciones", {
  id: uuid("id").primaryKey().defaultRandom(),
  codigo: text("codigo").notNull().unique(),
  creadoPor: uuid("creado_por")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  usadoPor: uuid("usado_por").references(() => users.id, { onDelete: "set null" }),
  usadoEn: timestamp("usado_en", { withTimezone: true }),
  creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
});

export const expedientes = pgTable("expedientes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  numero: text("numero").notNull(),
  caratula: text("caratula").notNull(),
  // Ya no se muestra ni se pide (todo es penal). Se conserva la columna para
  // no perder lo cargado; los expedientes nuevos toman "Penal" por defecto.
  fuero: text("fuero").notNull().default("Penal"),
  estado: estadoExpedienteEnum("estado").notNull().default("En investigación"),
  // Opcional: los expedientes cargados antes de agregar este campo quedan sin tipo.
  tipo: tipoExpedienteEnum("tipo"),
  // Ya no se muestra en el expediente: se completa con el nombre del usuario
  // al crearlo (lo sigue usando la pantalla de carga de trabajo).
  responsable: text("responsable").notNull(),
  fechaInicio: date("fecha_inicio").notNull(),
  // Se muestra como "Síntesis" (texto largo del expediente).
  observaciones: text("observaciones"),
  // Se muestra como "Observaciones": nota corta visible en la planilla.
  nota: text("nota"),
  creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
  actualizadoEn: timestamp("actualizado_en", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`now()`),
});

export const personas = pgTable("personas", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expedienteId: uuid("expediente_id")
    .notNull()
    .references(() => expedientes.id, { onDelete: "cascade" }),
  nombre: text("nombre").notNull(),
  // Las personas cargadas antes de agregar este campo quedan como "Imputado".
  rol: rolPersonaEnum("rol").notNull().default("Imputado"),
  situacion: situacionPersonaEnum("situacion").notNull().default("Libre"),
  lugarDetencion: lugarDetencionEnum("lugar_detencion"),
  defensor: text("defensor"),
  observaciones: text("observaciones"),
});

export const partes = pgTable("partes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expedienteId: uuid("expediente_id")
    .notNull()
    .references(() => expedientes.id, { onDelete: "cascade" }),
  rol: rolParteEnum("rol").notNull(),
  nombre: text("nombre").notNull(),
});

export const plazos = pgTable("plazos", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expedienteId: uuid("expediente_id")
    .notNull()
    .references(() => expedientes.id, { onDelete: "cascade" }),
  categoria: categoriaPlazoEnum("categoria").notNull().default("procesal"),
  personaId: uuid("persona_id").references(() => personas.id, { onDelete: "cascade" }),
  tipo: text("tipo").notNull(),
  descripcion: text("descripcion"),
  fechaInicio: date("fecha_inicio").notNull(),
  fechaVencimiento: date("fecha_vencimiento").notNull(),
  responsable: text("responsable").notNull(),
  observaciones: text("observaciones"),
  cumplido: boolean("cumplido").notNull().default(false),
  cumplidoEn: timestamp("cumplido_en", { withTimezone: true }),
  // Ampliaciones: cantidad aplicada y vencimiento previo a la primera.
  ampliaciones: integer("ampliaciones").notNull().default(0),
  fechaVencimientoOriginal: date("fecha_vencimiento_original"),
  // Suspensión: si `suspendidoDesde` tiene fecha, el plazo no corre. Al
  // reanudarlo se recalcula el vencimiento con los días hábiles que restaban.
  suspendidoDesde: date("suspendido_desde"),
  diasHabilesAlSuspender: integer("dias_habiles_al_suspender"),
});

export const tareas = pgTable("tareas", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expedienteId: uuid("expediente_id")
    .notNull()
    .references(() => expedientes.id, { onDelete: "cascade" }),
  personaId: uuid("persona_id").references(() => personas.id, { onDelete: "set null" }),
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion"),
  responsable: text("responsable").notNull(),
  fechaLimite: date("fecha_limite").notNull(),
  estado: estadoTareaEnum("estado").notNull().default("Pendiente"),
});

export const audiencias = pgTable("audiencias", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expedienteId: uuid("expediente_id")
    .notNull()
    .references(() => expedientes.id, { onDelete: "cascade" }),
  // Audiencia o citación. Lo cargado antes de este campo queda como "Audiencia".
  clase: claseAudienciaEnum("clase").notNull().default("Audiencia"),
  fecha: date("fecha").notNull(),
  hora: time("hora"),
  tipo: text("tipo").notNull(),
  lugar: text("lugar"),
  observaciones: text("observaciones"),
  // Texto validado contra RESULTADOS_AUDIENCIA / RESULTADOS_CITACION (no es
  // enum de Postgres para poder sumar opciones sin migración).
  resultado: text("resultado"),
  resultadoDetalle: text("resultado_detalle"),
});

export const feriados = pgTable("feriados", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fecha: date("fecha").notNull(),
  nombre: text("nombre").notNull(),
});

export const configuracionNotificaciones = pgTable("configuracion_notificaciones", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  anticipaciones: jsonb("anticipaciones")
    .notNull()
    .default(sql`'{"15":false,"7":true,"3":true,"1":true,"0":true}'::jsonb`),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  expedientes: many(expedientes),
  configuracionNotificaciones: one(configuracionNotificaciones),
}));

export const expedientesRelations = relations(expedientes, ({ one, many }) => ({
  usuario: one(users, {
    fields: [expedientes.userId],
    references: [users.id],
  }),
  personas: many(personas),
  partes: many(partes),
  plazos: many(plazos),
  tareas: many(tareas),
  audiencias: many(audiencias),
}));

export const personasRelations = relations(personas, ({ one, many }) => ({
  expediente: one(expedientes, {
    fields: [personas.expedienteId],
    references: [expedientes.id],
  }),
  plazos: many(plazos),
  tareas: many(tareas),
}));

export const partesRelations = relations(partes, ({ one }) => ({
  expediente: one(expedientes, {
    fields: [partes.expedienteId],
    references: [expedientes.id],
  }),
}));

export const plazosRelations = relations(plazos, ({ one }) => ({
  expediente: one(expedientes, {
    fields: [plazos.expedienteId],
    references: [expedientes.id],
  }),
  persona: one(personas, {
    fields: [plazos.personaId],
    references: [personas.id],
  }),
}));

export const tareasRelations = relations(tareas, ({ one }) => ({
  expediente: one(expedientes, {
    fields: [tareas.expedienteId],
    references: [expedientes.id],
  }),
  persona: one(personas, {
    fields: [tareas.personaId],
    references: [personas.id],
  }),
}));

export const audienciasRelations = relations(audiencias, ({ one }) => ({
  expediente: one(expedientes, {
    fields: [audiencias.expedienteId],
    references: [expedientes.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Invitacion = typeof invitaciones.$inferSelect;
export type Expediente = typeof expedientes.$inferSelect;
export type NewExpediente = typeof expedientes.$inferInsert;
export type Persona = typeof personas.$inferSelect;
export type NewPersona = typeof personas.$inferInsert;
export type Parte = typeof partes.$inferSelect;
export type NewParte = typeof partes.$inferInsert;
export type Plazo = typeof plazos.$inferSelect;
export type NewPlazo = typeof plazos.$inferInsert;
export type Tarea = typeof tareas.$inferSelect;
export type NewTarea = typeof tareas.$inferInsert;
export type Audiencia = typeof audiencias.$inferSelect;
export type NewAudiencia = typeof audiencias.$inferInsert;
export type Feriado = typeof feriados.$inferSelect;
export type NewFeriado = typeof feriados.$inferInsert;
export type ConfiguracionNotificaciones = typeof configuracionNotificaciones.$inferSelect;
