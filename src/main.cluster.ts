import os from 'node:os';
import cluster from 'node:cluster';
import { Logger, type INestApplication } from '@nestjs/common';
import { isProduction } from './config/env.config';
import type { FastifyAdapter } from '@nestjs/platform-fastify';

export async function RunCluster(bootstrap: () => Promise<INestApplication<FastifyAdapter>>) {
	console.clear();
	const logger = new Logger('AppCluster');
	const numCPUs = Math.max(1, os.cpus().length - 1);

	if (cluster.isPrimary && isProduction && os.platform() === 'linux') {
		logger.log(`Primary ${process.pid} is running`);
		logger.log(`Starting ${numCPUs} workers...`);

		for (let i = 0; i < numCPUs; i++) cluster.fork();

		let restartCount = 0;
		cluster.on('exit', (worker, code, signal) => {
			logger.error(`Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}).`);
			restartCount++;

			if (restartCount > 10) {
				logger.error('Too many worker restarts, shutting down master.');
				process.exit(1);
			}

			setTimeout(() => {
				logger.log('Restarting worker...');
				cluster.fork();
			}, 2000); // 2s backoff
		});
	} else {
		const app = await bootstrap();
		if (typeof app.enableShutdownHooks === 'function') app.enableShutdownHooks();

		const shutdown = async (signal: string) => {
			logger.log(`Received ${signal}, shutting down gracefully...`);
			try {
				if (typeof app.close === 'function') await app.close();
				process.exit(0);
			} catch (err) {
				logger.error(`Error during shutdown: ${(err as Error).message}`);
				process.exit(1);
			}
		};

		process.on('SIGTERM', () => shutdown('SIGTERM'));
		process.on('SIGINT', () => shutdown('SIGINT'));
	}
}
