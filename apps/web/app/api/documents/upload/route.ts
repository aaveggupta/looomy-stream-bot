import { auth } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@database/prisma";
import { chunkText } from "@/lib/chunker";
import { generateEmbeddings } from "@/lib/openai";
import { upsertVectors, VectorMetadata } from "@/lib/pinecone";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const filename = file.name;
    const fileType = filename.split(".").pop()?.toLowerCase();

    if (!["pdf", "txt"].includes(fileType || "")) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF and TXT are supported." },
        { status: 400 }
      );
    }

    // Read file content
    let content: string;

    if (fileType === "txt") {
      content = await file.text();
    } else if (fileType === "pdf") {
      // Dynamic import for pdf-parse
      const pdfParse = (await import("pdf-parse")).default;
      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfData = await pdfParse(buffer);
      content = pdfData.text;
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    // Create document in database
    const document = await prisma.document.create({
      data: {
        userId,
        filename,
        content,
        isEmbedded: false,
      },
    });

    // Chunk the text
    const chunks = chunkText(content);

    // Generate embeddings for all chunks
    const embeddings = await generateEmbeddings(chunks.map((c) => c.text));

    // Prepare vectors for Pinecone
    const vectors = chunks.map((chunk, i) => ({
      id: `${document.id}-${chunk.index}`,
      values: embeddings[i],
      metadata: {
        userId,
        documentId: document.id,
        text: chunk.text,
        chunkIndex: chunk.index,
      } as VectorMetadata,
    }));

    // Upsert to Pinecone
    await upsertVectors(vectors);

    // Mark document as embedded
    await prisma.document.update({
      where: { id: document.id },
      data: { isEmbedded: true },
    });

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        filename: document.filename,
        chunks: chunks.length,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process document" },
      { status: 500 }
    );
  }
}
