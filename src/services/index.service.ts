import { Injectable } from '@nestjs/common';
import * as lunr from 'lunr';
import * as fs from 'fs';
import * as path from 'path';
import { JsonDoc, ResultDocs, ResultDoc, TreeNode } from '../types';
import { default as axios, AxiosResponse } from 'axios';
import { curry } from 'ramda';

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

  clearRawFiles() {
    const basedir = './data/raw';
    fs.readdirSync(basedir).forEach(async (f) => {
      if (!f.endsWith('.json')) {
        return;
      }
      fs.unlinkSync(path.join(basedir, f));
    });
  }

  async loadRaw() {
    const getApiUrl = (user: string, repo: string) =>
      `https://api.github.com/repos/${user}/${repo}/git/trees/HEAD?recursive=1`;

    const getJsonUrl = (user: string, repo: string, path: string) =>
      `https://raw.githubusercontent.com/${user}/${repo}/HEAD/${path}`;

    const bucketIndexResponse = await axios.get(
      'https://raw.githubusercontent.com/lukesampson/scoop/HEAD/buckets.json',
    );
    const eachPackage = async (user: string, repo: string, bucketName: string, node: TreeNode) => {
      const match = node.path.match(/bucket\/([^\.]+)\.json$/);
      if (node.type !== 'blob' || match === null) {
        return;
      }
      const response = await axios.get(getJsonUrl(user, repo, node.path));
      const json = response.data;
      json['bucket'] = bucketName;
      json['name'] = match[1];
      json['id'] = `${repo} - ${match[1]}`;
      fs.writeFile(`./data/raw/${json['id']}.json`, JSON.stringify(json), (err) => {
        if (err) {
          console.error(err);
        }
      });
    };
    const eachBucket = async (response: AxiosResponse, bucketName: string) => {
      const url = response.data[bucketName];
      const [user, repo] = url.split('/').slice(-2);
      const bucketReponse = await axios.get(getApiUrl(user, repo));
      bucketReponse.data.tree.forEach(curry(eachPackage)(user, repo, bucketName));
    };

    const keys = Object.keys(bucketIndexResponse.data);
    for (const bucketName of keys) {
      await eachBucket(bucketIndexResponse, bucketName);
    }
  }

  buildIndex() {
    let documents: ResultDocs = {};
    const index = lunr(function () {
      this.ref('id');
      this.field('name');
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
  }

  async refreshIndex() {
    this.clearRawFiles();
    await this.loadRaw();
    this.buildIndex();
  }
}
