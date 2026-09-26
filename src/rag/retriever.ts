import { documents } from "../rag/documents";


export const retriveDocuments = (query: string): string => {
  const queryWords = query.toLowerCase().split(" ");

  let bestDocument : string = documents[0] ?? " ";
  let bestScore = 0;

  for (const doc of documents) {
    let score = 0;

    for (const word of queryWords) {
      if (doc.toLowerCase().includes(word)) {
        score = score + 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestDocument = doc;
    }
  }

  return bestDocument;
};
