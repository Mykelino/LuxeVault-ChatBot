import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = process.env.GEMINI_API_KEY || process.env.gemini_api_key || process.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  if (!API_KEY) return res.status(500).json({ error: "API Key Missing" });

  try {
    const { price, hourlyWage, topCategory, categorySpending } = req.body;
    const prompt = `Price: ${price}€, Wage: ${hourlyWage}€/h. User spent ${categorySpending}€ in ${topCategory}. Italian tough love response.`;

    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro"];
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        return res.json({ text: result.response.text() });
      } catch (e) { }
    }
    throw new Error("Chat model failed");
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
