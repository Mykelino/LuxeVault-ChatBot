import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  if (!API_KEY) {
    console.error("CRITICAL ERROR: No Gemini API Key found.");
    return res.status(500).json({ error: "API Key Missing" });
  }

  try {
    const { text } = req.body;
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    
    const prompt = `Extract expense details from: "${text}". 
    Current date: ${currentDate}, time: ${currentTime}.
    Return ONLY JSON with this format: { "amount": number, "category": string, "description": string, "date": "YYYY-MM-DD", "time": "HH:mm" or null }.
    Categories: Cibo, Trasporti, Shopping, Salute, Svago, Casa, Altro, Generale.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: "v1" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean code blocks if present
    const jsonString = responseText.replace(/```json\n?|```/g, "").trim();
    res.json(JSON.parse(jsonString));
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message });
  }
}
