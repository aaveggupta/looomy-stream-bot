import { Pinecone } from "@pinecone-database/pinecone";
import { getRequiredEnv } from "./env";
import { TIMEOUT_CONFIG } from "./config";

let pineconeClient: Pinecone | null = null;

export function getPinecone(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: getRequiredEnv("PINECONE_API_KEY"),
    });
  }
  return pineconeClient;
}

export function getIndex() {
  const pinecone = getPinecone();
  return pinecone.index(getRequiredEnv("PINECONE_INDEX"));
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

  const upsertPromise = index.upsert(vectors);

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error("Pinecone upsert timeout")),
      TIMEOUT_CONFIG.PINECONE
    )
  );

  await Promise.race([upsertPromise, timeoutPromise]);
}

export async function queryVectors(
  userId: string,
  embedding: number[],
  topK: number = 5
) {
  const index = getIndex();

  // Add timeout using Promise.race
  const queryPromise = index.query({
    vector: embedding,
    topK,
    filter: { userId },
    includeMetadata: true,
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error("Pinecone query timeout")),
      TIMEOUT_CONFIG.PINECONE
    )
  );

  const results = (await Promise.race([
    queryPromise,
    timeoutPromise,
  ])) as Awaited<typeof queryPromise>;
  return results.matches || [];
}

export async function deleteVectorsByDocument(documentId: string) {
  const index = getIndex();

  const deletePromise = index.deleteMany({ documentId });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error("Pinecone delete timeout")),
      TIMEOUT_CONFIG.PINECONE
    )
  );

  await Promise.race([deletePromise, timeoutPromise]);
}

export async function deleteVectorsByUser(userId: string) {
  const index = getIndex();

  const deletePromise = index.deleteMany({ userId });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error("Pinecone delete timeout")),
      TIMEOUT_CONFIG.PINECONE
    )
  );

  await Promise.race([deletePromise, timeoutPromise]);
}
