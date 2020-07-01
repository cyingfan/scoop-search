import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { IndexService } from './index.service';

@Module({
  imports: [],
  controllers: [ApiController],
  providers: [IndexService],
})
export class ApiModule {}
