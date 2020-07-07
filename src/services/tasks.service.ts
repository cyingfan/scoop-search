import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { IndexService } from './index.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly indexService: IndexService) {}

  @Cron('0 0 * * * *')
  handleCron() {
    this.indexService.refreshIndex();
    this.logger.debug('Refreshing index');
  }
}
