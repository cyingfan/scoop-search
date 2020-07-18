import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ApiController } from './api.controller';
import { IndexService } from './services/index.service';
import { TasksService } from './services/tasks.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [ApiController],
  providers: [IndexService, TasksService],
})
export class ApiModule {}
