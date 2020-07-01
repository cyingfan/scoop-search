import { Controller, Get, Req, Render } from '@nestjs/common';
import { Request } from 'express';
import { IndexService } from './index.service';
import { ResultDoc } from './types';

@Controller('scoop')
export class ApiController {
  constructor(private readonly indexService: IndexService) {}

  @Get()
  find(@Req() request: Request): ResultDoc[] {
    return this.indexService.search(request.param('query', ''));
  }

  @Get('demo')
  @Render('demo')
  demo() {}
}
