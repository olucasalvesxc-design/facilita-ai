import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
let app: App;
if (getApps().length === 0) {
  app = initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || "gen-lang-client-0252520614",
  });
} else {
  app = getApps()[0];
}

const firestore = getFirestore(app);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON (vital for webhooks)
  app.use(express.json());

  // Kirvano Webhook Endpoint
  app.post("/api/webhooks/kirvano", async (req, res) => {
    const payload = req.body;
    // Kirvano envia o token no header 'x-kirvano-token' ou similar dependendo da configuração
    const token = req.headers["x-kirvano-token"] || req.headers["authorization"];

    console.log("Kirvano Webhook received:", JSON.stringify(payload, null, 2));

    // Verificação de Segurança
    const expectedSecret = process.env.KIRVANO_WEBHOOK_SECRET;
    if (expectedSecret && token !== expectedSecret) {
      console.warn("Webhook negado: Token inválido ou ausente.");
      return res.status(401).send("Unauthorized");
    }

    try {
      const eventType = payload.event || payload.type;
      const status = payload.status || (payload.data && payload.data.status);
      const externalId = payload.external_id || (payload.data && payload.data.external_id);
      const productId = payload.product?.id || (payload.data && payload.data.product_id);

      // IDs dos produtos na Kirvano vindos do .env
      const PRO_PRODUCT_ID = process.env.KIRVANO_PRO_PRODUCT_ID || "a9e4a8e1-a4c3-43de-933e-21cff8f3f8a3";
      const VERIFIED_PRODUCT_ID = process.env.KIRVANO_VERIFIED_PRODUCT_ID || "b76e028d-396a-4393-87fb-6c77c0dd71a1";

      // Check if it's an approval event
      if (eventType === "order.approved" || status === "approved" || status === "paid") {
        if (!externalId) {
          console.warn("No external_id found in payload");
          return res.status(200).send("No external_id");
        }

        console.log(`Processing payment for user: ${externalId}, Product: ${productId}`);

        // Update User Profile
        const updates: any = {
          subscriptionUpdatedAt: FieldValue.serverTimestamp()
        };

        const proUpdates: any = {
          lastActiveAt: FieldValue.serverTimestamp()
        };

        if (productId === PRO_PRODUCT_ID || !productId) {
          // If no productId is sent, we default to activating Pro for safety (historical reasons)
          updates.role = "pro";
          updates.hasActiveSubscription = true;
          
          proUpdates.subscriptionStatus = "active";
          proUpdates.subscriptionType = "monthly_pro";
        }

        if (productId === VERIFIED_PRODUCT_ID) {
          updates.isVerified = true;
          proUpdates.isVerified = true;
          proUpdates.verificationStatus = "verified";
        }

        // Apply updates to users collection
        await firestore.collection("users").doc(externalId).update(updates);

        // Update Professional Profile if it exists
        const proRef = firestore.collection("professionals").doc(externalId);
        const proDoc = await proRef.get();
        
        if (proDoc.exists) {
          await proRef.update(proUpdates);
        }

        return res.status(200).send("Success");
      }

      res.status(200).send("Event ignored");
    } catch (error) {
      console.error("Error processing Kirvano webhook:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // API Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Webhook URL: http://localhost:${PORT}/api/webhooks/kirvano`);
  });
}

startServer();
