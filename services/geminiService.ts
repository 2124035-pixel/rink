
import { GoogleGenAI } from "@google/genai";

// APIキーは環境変数から取得します。
// process.env.API_KEYはビルド環境で設定されていることを前提とします。
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API_KEY is not defined in environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

export const summarizeText = async (text: string): Promise<string> => {
  if (!text) {
    throw new Error("Input text cannot be empty.");
  }

  try {
    const prompt = `以下の文章を、重要なポイントを保持したまま簡潔に要約してください。箇条書きなどを用いて分かりやすくまとめてください。\n\n---\n\n${text}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error summarizing text with Gemini API:", error);
    throw new Error("Failed to generate summary.");
  }
};
