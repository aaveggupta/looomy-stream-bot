import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }
  return openaiClient;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAI();
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const openai = getOpenAI();
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });
  return response.data.map((d) => d.embedding);
}

export async function generateChatResponse(
  context: string,
  question: string,
  botName: string
): Promise<string> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are ${botName}, a helpful assistant for a YouTube live stream. Answer questions based on the provided context. If the context doesn't contain relevant information, say you don't have information about that topic. Keep responses concise and friendly, suitable for live chat (under 200 characters if possible).`,
      },
      {
        role: "user",
        content: `Context:\n${context}\n\nQuestion: ${question}`,
      },
    ],
    max_tokens: 150,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || "I couldn't generate a response.";
}
