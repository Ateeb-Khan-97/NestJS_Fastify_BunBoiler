import { Global, Module } from '@nestjs/common';
import { DatabaseHealthService } from './database-health.service';
import { drizzleProvider } from './drizzle.provider';

@Global()
@Module({
	providers: [drizzleProvider, DatabaseHealthService],
	exports: [drizzleProvider],
})
export class DatabaseModule {}
