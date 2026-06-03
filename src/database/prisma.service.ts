import { env, isProduction } from '@/config/env.config';
import { PrismaClient } from '@/generated/prisma/client';
import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	private readonly logger = new Logger(PrismaService.name);

	constructor() {
		// Driver adapter — Prisma talks to Postgres through node-postgres (pg) instead
		// of the bundled Rust engine, which the "client" engineType + Bun runtime need.
		const adapter = new PrismaPg({
			connectionString: env.PG_URL,
			max: 8,
		});

		super({
			adapter,
			log: isProduction ? ['error'] : ['query', 'warn', 'error'],
		});
	}

	async onModuleInit() {
		// Fail fast: verify the connection during startup so a misconfigured database
		// surfaces immediately instead of on the first request.
		try {
			await this.$connect();
			this.logger.log('Database connected');
		} catch (err) {
			this.logger.error('Database connection failed', err instanceof Error ? err.message : String(err));
			process.exit(1);
		}
	}
}
