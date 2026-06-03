import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from './drizzle.provider';

@Injectable()
export class DatabaseHealthService implements OnModuleInit {
	private readonly logger = new Logger(DatabaseHealthService.name);

	constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

	async onModuleInit() {
		try {
			await this.db.execute(sql`SELECT 1`);
			this.logger.log('Database connected');
		} catch (err) {
			this.logger.error('Database connection failed', err instanceof Error ? err.message : String(err));
			process.exit(1);
		}
	}
}
