import { Injectable } from '@nestjs/common';
import * as lunr from 'lunr';
import * as fs from 'fs';
import { ResultDocs, ResultDoc } from './types';

@Injectable()
export class IndexService {
  private index: lunr.Index;
  private documents: ResultDocs;

  constructor() {
    this.index = lunr.Index.load(JSON.parse(fs.readFileSync('data/index.json').toString()));
    this.documents = JSON.parse(fs.readFileSync('data/documents.json').toString());
  }

  search(query: string): ResultDoc[] {
    const result = this.index.search(query);
    return result.map((result) => this.documents[result.ref]);
  }
}
