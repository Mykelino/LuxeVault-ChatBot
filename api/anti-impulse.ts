import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = process.env.GEMINI_API_KEY || process.env.gemini_api_key || process.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  if (!API_KEY) return res.status(500).json({ error: "API Key Missing" });

  try {
    const { price, hourlyWage, topCategory, categorySpending, lang } = req.body;
    let prompt = "";
    if (lang === 'en') {
      prompt = `Price: ${price}€, Salary: ${hourlyWage}€/h. User has spent ${categorySpending}€ in ${topCategory}. Respond in English with a "tough love" tone (firm but motivating), typical of an elite financial assistant. Explain how much they need to work to afford it.`;
    } else {
      prompt = `Prezzo: ${price}€, Salario: ${hourlyWage}€/h. L'utente ha speso ${categorySpending}€ in ${topCategory}. Rispondi in italiano con un tono "tough love" (deciso ma motivante), tipico di un assistente finanziario d'élite. Spiega quanto deve lavorare per permetterselo.`;
    }

    const modelsToTry = ["gemini-2.5-flash", "gemini-2.5-pro"];
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
