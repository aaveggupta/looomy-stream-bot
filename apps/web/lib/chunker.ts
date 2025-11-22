export interface TextChunk {
  text: string;
  index: number;
}

export function chunkText(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): TextChunk[] {
  const chunks: TextChunk[] = [];

  // Clean up the text
  const cleanedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (cleanedText.length <= chunkSize) {
    return [{ text: cleanedText, index: 0 }];
  }

  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < cleanedText.length) {
    let endIndex = startIndex + chunkSize;

    // If this is not the last chunk, try to find a good break point
    if (endIndex < cleanedText.length) {
      // Look for paragraph break
      const paragraphBreak = cleanedText.lastIndexOf("\n\n", endIndex);
      if (paragraphBreak > startIndex + chunkSize / 2) {
        endIndex = paragraphBreak;
      } else {
        // Look for sentence break
        const sentenceBreak = cleanedText.lastIndexOf(". ", endIndex);
        if (sentenceBreak > startIndex + chunkSize / 2) {
          endIndex = sentenceBreak + 1;
        } else {
          // Look for any newline
          const newlineBreak = cleanedText.lastIndexOf("\n", endIndex);
          if (newlineBreak > startIndex + chunkSize / 2) {
            endIndex = newlineBreak;
          }
        }
      }
    }

    const chunkText = cleanedText.slice(startIndex, endIndex).trim();
    if (chunkText.length > 0) {
      chunks.push({ text: chunkText, index: chunkIndex });
      chunkIndex++;
    }

    // Move start index, accounting for overlap
    startIndex = endIndex - overlap;
    if (startIndex < 0) startIndex = 0;

    // Prevent infinite loop
    if (startIndex >= cleanedText.length - 1) break;
    if (endIndex >= cleanedText.length) break;
  }

  return chunks;
}
