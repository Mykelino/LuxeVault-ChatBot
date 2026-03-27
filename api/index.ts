import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Gemini Initialization
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Endpoints
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.post("/api/gemini/process-expense", async (req, res) => {
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
    console.error("Gemini server error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/gemini/process-receipt", async (req, res) => {
  try {
    const { base64Image, mimeType } = req.body;
    const currentDate = new Date().toISOString().split('T')[0];
    const prompt = `Analyze this receipt. Current date: ${currentDate}. 
    Return JSON: { date: string, time: string, items: Array<{ amount: number, category: string, description: string }> }.`;

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        { role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Image, mimeType } }] }
      ]
    });
    res.json(JSON.parse(result.text));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/gemini/anti-impulse", async (req, res) => {
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
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/calculate-labor", (req, res) => {
  const { price, hourlyWage } = req.body;
  if (!price || !hourlyWage) return res.status(400).json({ error: "Required fields missing" });
  res.json({ hours: (price / hourlyWage).toFixed(2) });
});

export default app;
