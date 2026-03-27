import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { price, hourlyWage, topCategory, categorySpending } = req.body;
    const hours = (price / hourlyWage).toFixed(1);
    const prompt = `User wants to buy something for ${price}€. Hourly wage: ${hourlyWage}€, costs ${hours} hours. Top category: ${topCategory} (spent ${categorySpending}€). Italian luxury tough love response.`;
    
    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    res.json({ text: result.text });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message });
  }
}
