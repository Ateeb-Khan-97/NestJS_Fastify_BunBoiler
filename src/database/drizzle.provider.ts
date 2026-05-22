import { env, isProduction } from '@/config/env.config';
import { SQL } from 'bun';
import { drizzle } from 'drizzle-orm/bun-sql';
import * as schema from './schema';

/** DI token for the Drizzle database instance. */
export const DRIZZLE = Symbol('DRIZZLE');

function createDrizzle() {
	// Bun's native postgres driver (no `pg` package needed).
	const client = new SQL({
		url: env.PG_URL,
		max: 8,
		...(env.PG_SSL === 'true' ? { tls: { rejectUnauthorized: true } } : {}),
	});

	return drizzle({ client, schema, logger: !isProduction });
}

/** Type of the injected db, e.g. `@Inject(DRIZZLE) private db: DrizzleDB`. */
export type DrizzleDB = ReturnType<typeof createDrizzle>;

export const drizzleProvider = {
	provide: DRIZZLE,
	useFactory: createDrizzle,
};
