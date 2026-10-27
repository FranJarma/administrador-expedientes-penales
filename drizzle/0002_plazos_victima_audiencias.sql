CREATE TYPE "public"."clase_audiencia" AS ENUM('Audiencia', 'Citación');--> statement-breakpoint
CREATE TYPE "public"."rol_persona" AS ENUM('Imputado', 'Víctima');--> statement-breakpoint
CREATE TYPE "public"."tipo_expediente" AS ENUM('Carpeta judicial', 'Expediente físico');--> statement-breakpoint
ALTER TYPE "public"."rol_parte" ADD VALUE 'Asesoría';--> statement-breakpoint
ALTER TYPE "public"."situacion_persona" ADD VALUE 'Rebelde';--> statement-breakpoint
ALTER TABLE "expedientes" ALTER COLUMN "fuero" SET DEFAULT 'Penal';--> statement-breakpoint
ALTER TABLE "audiencias" ADD COLUMN "clase" "clase_audiencia" DEFAULT 'Audiencia' NOT NULL;--> statement-breakpoint
ALTER TABLE "audiencias" ADD COLUMN "resultado" text;--> statement-breakpoint
ALTER TABLE "audiencias" ADD COLUMN "resultado_detalle" text;--> statement-breakpoint
ALTER TABLE "expedientes" ADD COLUMN "tipo" "tipo_expediente";--> statement-breakpoint
ALTER TABLE "personas" ADD COLUMN "rol" "rol_persona" DEFAULT 'Imputado' NOT NULL;--> statement-breakpoint
ALTER TABLE "plazos" ADD COLUMN "ampliaciones" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "plazos" ADD COLUMN "fecha_vencimiento_original" date;--> statement-breakpoint
ALTER TABLE "plazos" ADD COLUMN "suspendido_desde" date;--> statement-breakpoint
ALTER TABLE "plazos" ADD COLUMN "dias_habiles_al_suspender" integer;
