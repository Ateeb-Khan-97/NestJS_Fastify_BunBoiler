import z from 'zod';

const envSchema = z.object({
	PORT: z.coerce.number().default(5000),
	NODE_ENV: z.enum(['development', 'production', 'staging']).default('development'),
	PG_URL: z.url(),
	JWT_ACCESS_SECRET: z.string(),
	JWT_REFRESH_SECRET: z.string(),
	JWT_ACCESS_EXP: z.coerce.number(),
	JWT_REFRESH_EXP: z.coerce.number(),
});

export const env = (() => {
	const parsed = envSchema.safeParse(Bun.env);
	if (parsed.success) return Object.freeze(parsed.data);

	console.error(z.treeifyError(parsed.error));
	process.exit(1);
})();

export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isStaging = env.NODE_ENV === 'staging';
