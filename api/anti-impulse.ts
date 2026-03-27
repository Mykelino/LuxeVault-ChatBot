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
    const { price, hourlyWage, topCategory, categorySpending } = req.body;
    const hours = (price / hourlyWage).toFixed(1);
    const prompt = `User wants to buy something for ${price}€. Hourly wage: ${hourlyWage}€, costs ${hours} hours. Top category: ${topCategory} (spent ${categorySpending}€). Italian luxury tough love response.`;
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: "v1" });
    const result = await model.generateContent(prompt);

    res.json({ text: result.response.text() });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message });
  }
}
