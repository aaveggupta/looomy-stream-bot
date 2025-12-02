import { Pinecone } from "@pinecone-database/pinecone";

let pineconeClient: Pinecone | null = null;

export function getPinecone(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pineconeClient;
}

export function getIndex() {
  const pinecone = getPinecone();
  return pinecone.index(process.env.PINECONE_INDEX!);
}

export interface VectorMetadata {
  userId: string;
  documentId: string;
  text: string;
  chunkIndex: number;
  [key: string]: string | number;
}

export async function upsertVectors(
  vectors: { id: string; values: number[]; metadata: VectorMetadata }[]
) {
  const index = getIndex();
  await index.upsert(vectors);
}

export async function queryVectors(
  userId: string,
  embedding: number[],
  topK: number = 5
) {
  const index = getIndex();
  const results = await index.query({
    vector: embedding,
    topK,
    filter: { userId },
    includeMetadata: true,
  });
  return results.matches || [];
}

export async function deleteVectorsByDocument(documentId: string) {
  const index = getIndex();
  await index.deleteMany({ documentId });
}

export async function deleteVectorsByUser(userId: string) {
  const index = getIndex();
  await index.deleteMany({ userId });
}
