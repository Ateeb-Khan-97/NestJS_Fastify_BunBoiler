import { env, isProduction } from '@/config/env.config';
import { drizzle } from 'drizzle-orm/bun-sql';
import * as schema from './schema';

export const DRIZZLE = Symbol('DRIZZLE');

function createDrizzle() {
	const client = new Bun.SQL({
		url: env.PG_URL,
		max: 8,
		...(env.PG_SSL === 'true' ? { tls: { rejectUnauthorized: true } } : {}),
	});

	return drizzle({ client, schema, logger: !isProduction });
}

export type DrizzleDB = ReturnType<typeof createDrizzle>;

export const drizzleProvider = {
	provide: DRIZZLE,
	useFactory: createDrizzle,
};
