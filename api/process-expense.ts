import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  if (!API_KEY) {
    console.error("CRITICAL ERROR: No Gemini API Key found in Environment Variables.");
    return res.status(500).json({ error: "API Key Missing. Check Vercel Settings -> Environment Variables." });
  }

  try {
    const { text } = req.body;
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    
    const prompt = `Extract expense details from: "${text}". 
    Current date: ${currentDate}, time: ${currentTime}.
    Return JSON: { amount: number, category: string, description: string, date: YYYY-MM-DD, time: HH:mm or null }.
    Categories: Cibo, Trasporti, Shopping, Salute, Svago, Casa, Altro, Generale.`;

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            date: { type: Type.STRING },
            time: { type: Type.STRING, nullable: true }
          },
          required: ["amount", "category", "description", "date"]
        }
      }
    });

    res.json(JSON.parse(result.text));
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message });
  }
}
