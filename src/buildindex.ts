import * as fs from 'fs';
import * as lunr from 'lunr';
import { JsonDoc, ResultDocs } from './types';

let documents: ResultDocs = new Map();
const index = lunr(function () {
  this.ref('id');
  this.field('description');
  this.field('bucket');

  const basedir = 'data/raw/';
  fs.readdirSync(basedir).forEach((f) => {
    if (!f.endsWith('.json')) {
      return;
    }
    const filepath = `${basedir}${f}`;
    try {
      const jsonDoc: JsonDoc = JSON.parse(fs.readFileSync(filepath).toString());
      const { id, name, bucket, description, version, homepage } = jsonDoc;
      documents[id] = { name, bucket, description, version, homepage };
      this.add(jsonDoc);
    } catch (e) {
      console.log(e, filepath);
    }
  });
});

fs.writeFileSync('data/index.json', JSON.stringify(index));
fs.writeFileSync('data/documents.json', JSON.stringify(documents));
