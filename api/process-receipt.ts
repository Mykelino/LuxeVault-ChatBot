import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = process.env.GEMINI_API_KEY || process.env.gemini_api_key || process.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  if (!API_KEY) return res.status(500).json({ error: "API Key Missing" });

  try {
    const { base64Image, mimeType, lang } = req.body;
    let prompt = "";
    if (lang === 'en') {
      prompt = `Analyze this receipt. 
      Allowed categories: ["Food", "Transport", "Shopping", "Health", "Leisure", "Home", "Other"]. 
      Note: Food, water, and bread go into "Food". 
      Return ONLY JSON: {"date": "string (YYYY-MM-DD)", "time": "string (HH:mm)", "items": [{"amount": number (always positive), "category": string, "description": string}]}.`;
    } else {
      prompt = `Analizza questo scontrino. 
      Categorie ammesse: ["Cibo", "Trasporti", "Shopping", "Salute", "Svago", "Casa", "Altro"]. 
      NOTA: Spese alimentari, acqua e pane vanno in "Cibo". 
      Ritorna SOLO JSON: {"date": "string (YYYY-MM-DD)", "time": "string (HH:mm)", "items": [{"amount": number (sempre positivo), "category": string, "description": string}]}.`;
    }

    const modelsToTry = ["gemini-2.5-flash", "gemini-2.5-pro"];
    let lastError;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([prompt, { inlineData: { data: base64Image, mimeType } }]);
        const jsonMatch = result.response.text().match(/\{[\s\S]*\}/);
        if (jsonMatch) return res.json(JSON.parse(jsonMatch[0]));
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError || new Error("Vision models failed");
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
