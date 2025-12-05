import OpenAI from "openai";
import { BotPersonality } from "@prisma/client";

let openaiClient: OpenAI | null = null;

const personalityInstructions: Record<BotPersonality, string> = {
  FRIENDLY:
    "Be warm, casual, and conversational, like chatting with a good friend. Use friendly language and be approachable.",
  PROFESSIONAL:
    "Be polite, formal, and professional. Maintain a business-appropriate tone and be respectful.",
  EXCITED:
    "Be super enthusiastic and energetic! Use exclamation points and show genuine excitement about the topic!",
  ROASTING:
    "Be playfully sarcastic and teasing, but keep it lighthearted and fun. Never be mean-spirited.",
  CHILL:
    "Be laid back and relaxed. Use casual language, keep things easygoing, and don't overthink it.",
  MOTIVATIONAL:
    "Be encouraging, supportive, and inspiring. Help lift people up and motivate them to succeed.",
  TECHNICAL:
    "Be precise and detailed with technical information. Use proper terminology and be thorough.",
  HUMOROUS:
    "Be witty and funny! Use jokes, puns, and humor to keep things entertaining.",
};

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
  botName: string,
  personality: BotPersonality = "FRIENDLY"
): Promise<string> {
  const openai = getOpenAI();

  const personalityInstruction = personalityInstructions[personality];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are ${botName}, a helpful assistant for a YouTube live stream.

Personality: ${personalityInstruction}

Rules:
1. If context is provided and relevant, prioritize using it to answer the question.
2. If the context is not relevant or empty, you can answer using your general knowledge.
3. STRICTLY keep responses under 140 characters. This is a hard limit to ensure it fits in live chat.
4. Provide concise, direct, and high-quality answers (no fluff).
5. Match your personality style in every response.`,
      },
      {
        role: "user",
        content: context
          ? `Context:\n${context}\n\nQuestion: ${question}`
          : `Question: ${question}`,
      },
    ],
    max_tokens: 50,
    temperature: 0.7,
  });

  return (
    response.choices[0]?.message?.content || "I couldn't generate a response."
  );
}
