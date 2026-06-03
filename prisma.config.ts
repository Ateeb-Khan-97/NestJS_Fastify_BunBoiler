import { defineConfig } from 'prisma/config';

// Prisma 7 moved the Migrate/CLI connection URL out of schema.prisma and into
// this file. The runtime connection is handled separately by the driver adapter
// in src/database/prisma.service.ts. Bun auto-loads .env, so PG_URL is available
// here. We read via process.env (not the `env()` helper) so `prisma generate`
// — which needs no database — still works when PG_URL is absent (e.g. fresh clone).
// For TLS, include the relevant params (e.g. `?sslmode=require`) directly in PG_URL.
export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations',
	},
	datasource: {
		url: process.env.PG_URL ?? '',
	},
});
