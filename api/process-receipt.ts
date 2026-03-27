import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  if (!API_KEY) {
    console.error("CRITICAL ERROR: No Gemini API Key found.");
    return res.status(500).json({ error: "API Key Missing" });
  }

  try {
    const { base64Image, mimeType } = req.body;
    const currentDate = new Date().toISOString().split('T')[0];
    
    const prompt = `Analyze this receipt. Current date: ${currentDate}. 
    Extract date (YYYY-MM-DD), time (HH:mm or null) and items.
    Return JSON: { date: string, time: string, items: Array<{ amount: number, category: string, description: string }> }.`;

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        { role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Image, mimeType } }] }
      ]
    });

    res.json(JSON.parse(result.text));
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message });
  }
}
