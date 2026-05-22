import { DRIZZLE, type DrizzleDB } from '@/database/drizzle.provider';
import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicatorService, type HealthIndicatorResult } from '@nestjs/terminus';
import { sql } from 'drizzle-orm';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicatorService {
	constructor(
		@Inject(DRIZZLE)
		private readonly db: DrizzleDB,
	) {
		super();
	}

	async isHealthy(key: string): Promise<HealthIndicatorResult> {
		const indicator = this.check(key);
		try {
			await this.db.execute(sql`SELECT 1`);

			return indicator.up({
				database: 'connected',
				connection: true,
			});
		} catch (error) {
			return indicator.down({
				database: 'disconnected',
				error: (error as Error).message,
			});
		}
	}
}
