import { Logger, ValidationPipe, type INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './shared/filters/exception.filter';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { LoggerInterceptor } from './shared/interceptors/logger.interceptor';
import { env, isProduction } from './config/env.config';
import { SwaggerModule } from '@nestjs/swagger';
import { ScalarConfig, SwaggerConfig } from './config/swagger.config';
import { apiReference } from '@scalar/nestjs-api-reference';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { RunCluster } from './main.cluster';

async function bootstrap() {
	const logger = new Logger('NestFactory');
	const app = await NestFactory.create<INestApplication<FastifyAdapter>>(AppModule, new FastifyAdapter());

	app.enableCors();
	app.useGlobalPipes(new ValidationPipe());
	app.useGlobalFilters(new GlobalExceptionFilter());
	app.useGlobalInterceptors(new ResponseInterceptor(), new LoggerInterceptor());

	if (!isProduction) {
		const SwaggerFactory = SwaggerModule.createDocument(app, SwaggerConfig);
		app.use('/api/docs', apiReference(ScalarConfig(SwaggerFactory)));
	}

	await app.listen(env.PORT, '0.0.0.0');
	logger.log(`Application is running on: http://localhost:${env.PORT}`);
	if (!isProduction) logger.log(`Scalar docs available at http://localhost:${env.PORT}/api/docs`);

	return app;
}

await RunCluster(bootstrap);
