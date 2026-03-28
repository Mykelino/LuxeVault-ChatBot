export async function processExpense(text: string, lang: string = 'it') {
  const response = await fetch("/api/process-expense", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, lang })
  });
  if (!response.ok) throw new Error("Failed to process expense");
  return response.json();
}

export async function processReceiptImage(base64Image: string, mimeType: string, lang: string = 'it') {
  const response = await fetch("/api/process-receipt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64Image, mimeType, lang })
  });
  if (!response.ok) throw new Error("Failed to process receipt");
  return response.json();
}

export async function getAntiImpulseResponse(price: number, hourlyWage: number, topCategory: string, categorySpending: number, lang: string = 'it') {
  const response = await fetch("/api/anti-impulse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ price, hourlyWage, topCategory, categorySpending, lang })
  });
  if (!response.ok) throw new Error("Failed to get AI response");
  const data = await response.json();
  return data.text;
}
