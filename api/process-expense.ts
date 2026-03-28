import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Supporta sia maiuscolo che minuscolo per sicurezza
const API_KEY = process.env.GEMINI_API_KEY || process.env.gemini_api_key || process.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  if (!API_KEY) return res.status(500).json({ error: "API Key Missing" });

  try {
    const { text, lang } = req.body;
    const currentDate = new Date().toISOString().split('T')[0];
    
    let prompt = "";
    if (lang === 'en') {
      prompt = `Extract info from: "${text}". Current date: ${currentDate}. 
      Allowed categories: ["Food", "Transport", "Shopping", "Health", "Leisure", "Home", "Other"]. 
      Note: "Water", "Bread", "Groceries" go to "Food". 
      Return ONLY JSON: {"amount": number (or 0 if not found), "category": string, "description": string, "date": "YYYY-MM-DD", "time": "HH:mm" or null}.`;
    } else {
      prompt = `Estrai le informazioni da questa spesa: "${text}". Data corrente: ${currentDate}. 
      Categorie ammesse: ["Cibo", "Trasporti", "Shopping", "Salute", "Svago", "Casa", "Altro"]. 
      NOTA: "Acqua", "Pane", "Spesa" vanno in "Cibo". 
      Ritorna SOLO JSON: {"amount": number (oppure 0 se non trovato), "category": string, "description": string, "date": "YYYY-MM-DD", "time": "HH:mm" or null}.`;
    }

    // Prova diversi modelli in cascata finché uno non funziona
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.5-pro"];
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
      } catch (e: any) {
        lastError = e;
        console.warn(`${modelName} failed: ${e.message}`);
      }
    }
    throw lastError || new Error("All models failed");
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
