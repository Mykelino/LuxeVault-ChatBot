export async function processExpense(text: string) {
  const response = await fetch("/api/process-expense", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  if (!response.ok) throw new Error("Failed to process expense");
  return response.json();
}

export async function processReceiptImage(base64Image: string, mimeType: string) {
  const response = await fetch("/api/process-receipt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64Image, mimeType })
  });
  if (!response.ok) throw new Error("Failed to process receipt");
  return response.json();
}

export async function getAntiImpulseResponse(price: number, hourlyWage: number, topCategory: string, categorySpending: number) {
  const response = await fetch("/api/anti-impulse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ price, hourlyWage, topCategory, categorySpending })
  });
  if (!response.ok) throw new Error("Failed to get AI response");
  const data = await response.json();
  return data.text;
}
