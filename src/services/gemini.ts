import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function processExpense(text: string) {
  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  const prompt = `Extract expense details from the following text: "${text}". 
  The current date is ${currentDate} and current time is ${currentTime}.
  Return a JSON object with: 
  - amount (number)
  - category (string)
  - description (string)
  - date (string, format YYYY-MM-DD)
  - time (string, format HH:mm, null if not mentioned)
  
  IMPORTANT: If the text mentions quantities and unit prices (e.g., "10 banane a 10€ l'una"), CALCULATE the total amount (10 * 10 = 100).
  If a date is mentioned (e.g., "ieri", "il 22 marzo", "oggi"), extract it based on the current date (${currentDate}). 
  If a time is mentioned (e.g., "alle 15", "stasera alle 20:30"), extract it.
  Common categories: Food, Transport, Shopping, Entertainment, Bills, Health, Other.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          amount: { type: Type.NUMBER },
          category: { type: Type.STRING },
          description: { type: Type.STRING },
          date: { type: Type.STRING, description: "YYYY-MM-DD format" },
          time: { type: Type.STRING, description: "HH:mm format or null" }
        },
        required: ["amount", "category", "description", "date"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function processReceiptImage(base64Image: string, mimeType: string) {
  const currentDate = new Date().toISOString().split('T')[0];
  const prompt = `Analizza questa immagine di uno scontrino. 
  La data odierna è ${currentDate}.
  Estrai la data dello scontrino (formato YYYY-MM-DD), l'ora (formato HH:mm, null se non presente) e tutti gli articoli acquistati. 
  Per ogni articolo, identifica:
  - amount (numero, il prezzo dell'articolo)
  - category (stringa, una categoria adatta come Food, Transport, Shopping, etc.)
  - description (stringa, il nome dell'articolo)
  
  Restituisci un oggetto JSON con 'date' (stringa YYYY-MM-DD o null), 'time' (stringa HH:mm o null) e 'items' (array di oggetti).
  Se l'immagine non è uno scontrino o non è leggibile, restituisci { "date": null, "time": null, "items": [] }.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, description: "YYYY-MM-DD format" },
          time: { type: Type.STRING, description: "HH:mm format" },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                amount: { type: Type.NUMBER },
                category: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["amount", "category", "description"]
            }
          }
        },
        required: ["items"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function getAntiImpulseResponse(price: number, hourlyWage: number, topCategory: string, categorySpending: number) {
  const hours = (price / hourlyWage).toFixed(1);
  
  const prompt = `The user wants to buy something for ${price}€. 
  Their hourly wage is ${hourlyWage}€, meaning this costs ${hours} hours of their life.
  Their top spending category is ${topCategory} where they already spent ${categorySpending}€ this month.
  Give a short, elegant, "luxury" but "tough love" response in Italian. 
  Remind them of the labor cost and ask an uncomfortable question about their ${topCategory} spending.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  });
  return response.text;
}
