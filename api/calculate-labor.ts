import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { price, hourlyWage } = req.body;
    if (!price || !hourlyWage) return res.status(400).json({ error: "Required fields missing" });
    
    res.json({ hours: (price / hourlyWage).toFixed(2) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
