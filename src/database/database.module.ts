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
				synchronize: !isProduction, // false for production else production data can be loss
				logging: !isProduction,
				entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
				// ssl: isProduction ? { rejectUnauthorized: false } : false,
			}),
		}),
	],
	exports: [TypeOrmModule],
})
export class DatabaseModule {}
