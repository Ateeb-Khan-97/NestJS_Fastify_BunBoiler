import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './shared/guards/auth.guard';
import { PublicRateLimitGuard } from './shared/guards/public-rate-limit.guard';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
	imports: [
		ThrottlerModule.forRoot([{ name: 'public', ttl: 60000, limit: 10 }]),
		SharedModule,
		DatabaseModule,
		HealthModule,
		UserModule,
		AuthModule,
	],
	providers: [
		{ provide: APP_GUARD, useClass: AuthGuard },
		{ provide: APP_GUARD, useClass: PublicRateLimitGuard },
	],
})
export class AppModule {}
