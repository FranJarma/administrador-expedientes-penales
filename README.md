# Administrador de Expedientes Penales

MVP de aplicación web para que fiscales/funcionarios judiciales administren
expedientes penales, sus plazos procesales y el vencimiento de prisiones
preventivas.

## Stack

- Next.js (App Router) + TypeScript
- Postgres en Neon + Drizzle ORM
- Auth.js v5 (Credentials) con contraseñas hasheadas con Argon2
- Zod para validación de formularios y Server Actions
- Tailwind CSS + componentes propios estilo shadcn/ui

## Requisitos

- Node.js 20.9 o superior
- Una base de datos Postgres en [Neon](https://neon.tech)

## 1. Configurar variables de entorno

Copiá `.env.example` a `.env` y completá los valores:

```bash
cp .env.example .env
```

- `DATABASE_URL`: connection string de Neon (usá el "pooled connection
  string" desde el dashboard de Neon → Connection Details).
- `AUTH_SECRET`: secreto usado por Auth.js para firmar sesiones. Generalo
  con `npx auth secret` o `openssl rand -base64 33`.
- `AUTH_TRUST_HOST`: poné `"true"` si desplegás en un servidor propio
  (Docker, VPS) en vez de Vercel; si no, Auth.js rechaza las requests con
  un error `UntrustedHost`.
- `ADMIN_NOMBRE`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`: datos del primer usuario
  administrador, usados solo por el script de seed.

## 2. Instalar dependencias

```bash
npm install
```

## 3. Correr las migraciones

Esto crea todas las tablas en tu base de Neon:

```bash
npm run db:migrate
```

Si preferís generar el SQL de las migraciones vos mismo a partir del schema
(por ejemplo después de modificar `lib/db/schema.ts`):

```bash
npm run db:generate   # genera el SQL en /drizzle
npm run db:migrate    # lo aplica contra DATABASE_URL
```

También podés inspeccionar la base con Drizzle Studio:

```bash
npm run db:studio
```

## 4. Crear el usuario administrador y precargar feriados

No hay registro abierto: el primer usuario (rol `admin`) se crea por script,
usando `ADMIN_NOMBRE` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` del `.env`. El mismo
script le precarga los feriados de Argentina/Salta 2026.

```bash
npm run seed
```

Desde la sesión de ese admin podés generar códigos de invitación (pantalla
**Administración**) para que se registren el resto de los usuarios en
`/registro`.

## 5. Levantar en local

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). Te va a redirigir a
`/login`.

## Scripts disponibles

| Script              | Descripción                                         |
| -------------------- | ---------------------------------------------------- |
| `npm run dev`         | Servidor de desarrollo                              |
| `npm run build`       | Build de producción                                  |
| `npm run start`       | Levanta el build de producción                      |
| `npm run lint`        | ESLint                                              |
| `npm run db:generate` | Genera migraciones SQL a partir del schema Drizzle  |
| `npm run db:migrate`  | Aplica las migraciones contra `DATABASE_URL`        |
| `npm run db:push`     | Sincroniza el schema directo (sin migraciones), útil en desarrollo |
| `npm run db:studio`   | Abre Drizzle Studio                                 |
| `npm run seed`        | Crea el usuario admin y precarga feriados 2026       |

## Estructura del proyecto

```
/app
  /(auth)/login, /(auth)/registro   Login y registro (con código de invitación)
  /(app)/...                        Pantallas de la aplicación (requieren sesión)
/lib
  /db/schema.ts                     Tablas Drizzle
  /db/client.ts                     Cliente Neon + Drizzle
  /db/queries/*.ts                  Consultas agrupadas por entidad
  /auth/config.ts                   Configuración de Auth.js
  /validation/*.ts                  Esquemas Zod por entidad
  /business/dias-habiles.ts         Cálculo de días hábiles y feriados
  /business/semaforo.ts             Estado de vencimiento (semáforo)
/components                         Componentes de UI, por dominio
/actions                            Server Actions (mutaciones), por entidad
/scripts/seed.ts                    Seed de usuario admin + feriados
```

## Notas

- Los feriados 2026 precargados están tomados de fuentes públicas; conviene
  verificarlos contra el Boletín Oficial antes de usarlos para calcular un
  plazo real. Para años siguientes se cargan a mano desde la pantalla
  **Feriados**.
- El aislamiento de datos es por usuario (`user_id` en todas las tablas de
  dominio): cada usuario solo ve sus propios expedientes.
- El rate limiting de login es un contador en memoria (alcanza para el
  volumen de uso del MVP); en un despliegue con múltiples instancias
  convendría migrarlo a un store compartido.
