import { defineConfig } from 'prisma/config';

// Prisma 7 moved the Migrate/CLI connection URL out of schema.prisma and into
// this file. The runtime connection is handled separately by the driver adapter
// in src/database/prisma.provider.ts. Bun auto-loads .env, so PG_URL is available
// here. We read via process.env (not the `env()` helper) so `prisma generate`
// — which needs no database — still works when PG_URL is absent (e.g. fresh clone).
const url = process.env.PG_URL ?? '';
const datasourceUrl =
	process.env.PG_SSL === 'true' ? `${url}${url.includes('?') ? '&' : '?'}sslmode=require` : url;

export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations',
	},
	datasource: {
		url: datasourceUrl,
	},
});
