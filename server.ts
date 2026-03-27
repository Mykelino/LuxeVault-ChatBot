import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import processExpense from "./api/process-expense";
import processReceipt from "./api/process-receipt";
import antiImpulse from "./api/anti-impulse";
import calculateLabor from "./api/calculate-labor";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes for local development
  app.post("/api/process-expense", (req, res) => processExpense(req as any, res as any));
  app.post("/api/process-receipt", (req, res) => processReceipt(req as any, res as any));
  app.post("/api/anti-impulse", (req, res) => antiImpulse(req as any, res as any));
  app.post("/api/calculate-labor", (req, res) => calculateLabor(req as any, res as any));
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  // Vite/Static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LuxeVault AI Server running on PORT ${PORT}`);
  });
}

startServer();
