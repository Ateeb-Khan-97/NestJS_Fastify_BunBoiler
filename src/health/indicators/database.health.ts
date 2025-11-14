import { Injectable } from '@nestjs/common';
import { HealthIndicatorService, type HealthIndicatorResult } from '@nestjs/terminus';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicatorService {
	constructor(
		@InjectDataSource()
		private dataSource: DataSource,
	) {
		super();
	}

	async isHealthy(key: string): Promise<HealthIndicatorResult> {
		const indicator = this.check(key);
		try {
			await this.dataSource.query('SELECT 1');

			return indicator.up({
				database: 'connected',
				connection: this.dataSource.isInitialized,
			});
		} catch (error) {
			return indicator.down({
				database: 'disconnected',
				error: (error as Error).message,
			});
		}
	}
}
