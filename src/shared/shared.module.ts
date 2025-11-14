import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HttpService } from './services/http.service';
import { CommonService } from './services/common.service';

@Global()
@Module({
	imports: [HttpModule],
	providers: [CommonService, HttpService],
	exports: [CommonService, HttpService],
})
export class SharedModule {}
