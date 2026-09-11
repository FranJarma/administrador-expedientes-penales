CREATE TABLE "audiencias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"expediente_id" uuid NOT NULL,
	"fecha" date NOT NULL,
	"hora" time,
	"tipo" text NOT NULL,
	"lugar" text,
	"observaciones" text
);
--> statement-breakpoint
ALTER TABLE "partes" ALTER COLUMN "rol" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."rol_parte";--> statement-breakpoint
CREATE TYPE "public"."rol_parte" AS ENUM('Fiscalía', 'Querella', 'Defensa');--> statement-breakpoint
ALTER TABLE "partes" ALTER COLUMN "rol" SET DATA TYPE "public"."rol_parte" USING "rol"::"public"."rol_parte";--> statement-breakpoint
ALTER TABLE "audiencias" ADD CONSTRAINT "audiencias_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audiencias" ADD CONSTRAINT "audiencias_expediente_id_expedientes_id_fk" FOREIGN KEY ("expediente_id") REFERENCES "public"."expedientes"("id") ON DELETE cascade ON UPDATE no action;