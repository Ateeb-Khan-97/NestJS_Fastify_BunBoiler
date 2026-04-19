import { env, isProduction } from '@/config/env.config';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			useFactory: () => ({
				retryAttempts: 5,
				autoLoadEntities: true,
				poolSize: 8,
				type: 'postgres',
				url: env.PG_URL,
				synchronize: !isProduction,
				logging: !isProduction,
				entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
				ssl: env.PG_SSL === 'true' ? { rejectUnauthorized: true } : false,
			}),
		}),
	],
	exports: [TypeOrmModule],
})
export class DatabaseModule {}
