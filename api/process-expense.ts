import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Supporta sia maiuscolo che minuscolo per sicurezza
const API_KEY = process.env.GEMINI_API_KEY || process.env.gemini_api_key || process.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  if (!API_KEY) return res.status(500).json({ error: "API Key Missing" });

  try {
    const { text } = req.body;
    const currentDate = new Date().toISOString().split('T')[0];
    const prompt = `Extract info from: "${text}". Date: ${currentDate}. Return ONLY JSON: {"amount": number, "category": string, "description": string, "date": "YYYY-MM-DD", "time": "HH:mm" or null}.`;

    // Prova diversi modelli in cascata finché uno non funziona
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    let lastError;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        // Estrae il JSON cercando tra i tag markdown o l'intero testo
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return res.json(JSON.parse(jsonMatch[0]));
        }
      } catch (e) {
        lastError = e;
        console.warn(`${modelName} failed, trying next...`);
      }
    }
    throw lastError || new Error("All models failed");
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
