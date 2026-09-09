CREATE TYPE "public"."categoria_plazo" AS ENUM('procesal', 'prision_preventiva');--> statement-breakpoint
CREATE TYPE "public"."estado_expediente" AS ENUM('En investigación', 'Acusación formulada', 'En trámite', 'A resolución', 'Elevado a juicio', 'Demanda civil', 'Querella', 'Resuelto', 'Archivado');--> statement-breakpoint
CREATE TYPE "public"."estado_tarea" AS ENUM('Pendiente', 'En progreso', 'Completada');--> statement-breakpoint
CREATE TYPE "public"."lugar_detencion" AS ENUM('UC1', 'UC4', 'Alcaidía', 'Domiciliaria', 'Otro');--> statement-breakpoint
CREATE TYPE "public"."rol_parte" AS ENUM('Fiscalía', 'Querella', 'Actor civil', 'Demandado civil');--> statement-breakpoint
CREATE TYPE "public"."rol_usuario" AS ENUM('admin', 'usuario');--> statement-breakpoint
CREATE TYPE "public"."situacion_persona" AS ENUM('Libre', 'Detenido');--> statement-breakpoint
CREATE TABLE "configuracion_notificaciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"anticipaciones" jsonb DEFAULT '{"15":false,"7":true,"3":true,"1":true,"0":true}'::jsonb NOT NULL,
	CONSTRAINT "configuracion_notificaciones_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "expedientes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"numero" text NOT NULL,
	"caratula" text NOT NULL,
	"fuero" text NOT NULL,
	"estado" "estado_expediente" DEFAULT 'En investigación' NOT NULL,
	"responsable" text NOT NULL,
	"fecha_inicio" date NOT NULL,
	"observaciones" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feriados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"fecha" date NOT NULL,
	"nombre" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitaciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"codigo" text NOT NULL,
	"creado_por" uuid NOT NULL,
	"usado_por" uuid,
	"usado_en" timestamp with time zone,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitaciones_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "partes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"expediente_id" uuid NOT NULL,
	"rol" "rol_parte" NOT NULL,
	"nombre" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"expediente_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"situacion" "situacion_persona" DEFAULT 'Libre' NOT NULL,
	"lugar_detencion" "lugar_detencion",
	"defensor" text,
	"observaciones" text
);
--> statement-breakpoint
CREATE TABLE "plazos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"expediente_id" uuid NOT NULL,
	"categoria" "categoria_plazo" DEFAULT 'procesal' NOT NULL,
	"persona_id" uuid,
	"tipo" text NOT NULL,
	"descripcion" text,
	"fecha_inicio" date NOT NULL,
	"fecha_vencimiento" date NOT NULL,
	"responsable" text NOT NULL,
	"observaciones" text,
	"cumplido" boolean DEFAULT false NOT NULL,
	"cumplido_en" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tareas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"expediente_id" uuid NOT NULL,
	"persona_id" uuid,
	"titulo" text NOT NULL,
	"descripcion" text,
	"responsable" text NOT NULL,
	"fecha_limite" date NOT NULL,
	"estado" "estado_tarea" DEFAULT 'Pendiente' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"rol" "rol_usuario" DEFAULT 'usuario' NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "configuracion_notificaciones" ADD CONSTRAINT "configuracion_notificaciones_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expedientes" ADD CONSTRAINT "expedientes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feriados" ADD CONSTRAINT "feriados_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitaciones" ADD CONSTRAINT "invitaciones_creado_por_users_id_fk" FOREIGN KEY ("creado_por") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitaciones" ADD CONSTRAINT "invitaciones_usado_por_users_id_fk" FOREIGN KEY ("usado_por") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partes" ADD CONSTRAINT "partes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partes" ADD CONSTRAINT "partes_expediente_id_expedientes_id_fk" FOREIGN KEY ("expediente_id") REFERENCES "public"."expedientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personas" ADD CONSTRAINT "personas_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personas" ADD CONSTRAINT "personas_expediente_id_expedientes_id_fk" FOREIGN KEY ("expediente_id") REFERENCES "public"."expedientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plazos" ADD CONSTRAINT "plazos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plazos" ADD CONSTRAINT "plazos_expediente_id_expedientes_id_fk" FOREIGN KEY ("expediente_id") REFERENCES "public"."expedientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plazos" ADD CONSTRAINT "plazos_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_expediente_id_expedientes_id_fk" FOREIGN KEY ("expediente_id") REFERENCES "public"."expedientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE set null ON UPDATE no action;