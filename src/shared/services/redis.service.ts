import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { env } from '@/config/env.config';

@Injectable()
export class RedisService implements OnModuleInit {
	private readonly logger = new Logger(RedisService.name);
	private readonly client: Bun.RedisClient | undefined;
	private isConnected = false;

	constructor() {
		if (env.REDIS_URL) {
			this.client = new Bun.RedisClient(env.REDIS_URL);
		} else {
			this.logger.warn('Redis URL not provided');
		}
	}

	onModuleInit() {
		this.client
			?.connect()
			.then(() => {
				this.logger.log('Redis connected');
				this.isConnected = true;
			})
			.catch((err) => {
				this.logger.error('Redis connection failed', err);
			});
	}

	public async setData(key: string, value: string, ttl: number) {
		if (!this.isConnected) return undefined;
		await this.client?.set(key, value, 'EX', ttl);
	}

	public async getData(key: string) {
		if (!this.isConnected) return undefined;
		return this.client?.get(key);
	}

	public async deleteData(key: string) {
		if (!this.isConnected) return undefined;
		await this.client?.del(key);
	}
}
