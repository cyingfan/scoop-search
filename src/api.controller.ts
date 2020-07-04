import { Controller, Get, Req, Render } from '@nestjs/common';
import { Request } from 'express';
import { IndexService } from './index.service';
import { ResultDoc } from './types';

const tokenize = (query: string) => query.replace('/s{2,}/g', ' ').split(' ');

const formatDescriptionTerm = (word: string) => {
  const tolerance = Math.min(Math.max(1, Math.floor(word.length / 3)), 5);
  return `description:${word}~${tolerance}`;
};

const formatNameTerm = (word: string) => `name:*${word}*`;

const formatDescriptionQuery = (query: string) => tokenize(query).map(formatDescriptionTerm).join(' ');

const formatNameQuery = (query: string) => tokenize(query).map(formatNameTerm).join(' ');

@Controller('scoop')
export class ApiController {
  constructor(private readonly indexService: IndexService) {}

  @Get()
  find(@Req() request: Request): ResultDoc[] {
    const filteredQuery = (request.query.query.toString() || '').replace(/[^\s\w]/g, '').trim();
    if (filteredQuery.length === 0) {
      return [];
    }
    // const filteredQuery = (request.query.query.toString() || '').trim();
    if ('disableFuzzy' in request.query) {
      return this.indexService.search(filteredQuery);
    }
    return this.indexService.search(`${formatNameQuery(filteredQuery)} ${formatDescriptionQuery(filteredQuery)}`);
  }

  @Get('demo')
  @Render('demo')
  demo() {}
}
