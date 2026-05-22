import { defineConfig } from 'drizzle-kit';

// Read directly from process.env (not the app's zod-validated env) so drizzle-kit
// can run without every app secret being present. Bun loads .env automatically.
const url = process.env.PG_URL;
if (!url) throw new Error('PG_URL is not set — required by drizzle-kit');

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/database/schema/index.ts',
	out: './drizzle',
	dbCredentials: {
		url,
		ssl: process.env.PG_SSL === 'true',
	},
	verbose: true,
	strict: true,
});
