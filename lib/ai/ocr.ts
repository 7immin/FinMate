import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-3.1-flash-lite";

let client: GoogleGenAI | null = null;
function getClient() {
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

export interface ExtractDocumentParams {
  base64Data: string;
  mimeType: string;
  prompt: string;
  schema: Record<string, unknown>;
}

/**
 * Sends an uploaded photo/PDF to Gemini and returns the model's structured
 * JSON extraction, validated against `schema`.
 */
export async function extractDocumentData<T>(params: ExtractDocumentParams): Promise<T> {
  const ai = getClient();
  const isPdf = params.mimeType === "application/pdf";

  const interaction = await ai.interactions.create({
    model: MODEL,
    input: [
      { type: "text", text: params.prompt },
      isPdf
        ? { type: "document", data: params.base64Data, mime_type: params.mimeType }
        : { type: "image", data: params.base64Data, mime_type: params.mimeType },
    ],
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: params.schema,
    },
  });

  const text = interaction.output_text;
  if (!text) throw new Error("Gemini returned no output_text");
  return JSON.parse(text) as T;
}
