export type ResultDoc = {
  name: string;
  bucket: string;
  description: string;
  version: string;
  homepage: string;
};

export type JsonDoc = { id: string } & ResultDoc;

export type ResultDocs = { [key: string]: ResultDoc };
