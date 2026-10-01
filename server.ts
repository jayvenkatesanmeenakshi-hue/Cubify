import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import fs from "fs";
import admin from "firebase-admin";
import "dotenv/config";

// CJS/ESM hybrid safety for __dirname
let _dirname: string;
try {
  _dirname = path.dirname(fileURLToPath(import.meta.url));
} catch (e) {
  // @ts-ignore
  _dirname = __dirname;
}

const __dirname_resolved = _dirname;

// Initialize Firebase Admin once at startup
if (admin.apps.length === 0) {
  const serviceAccountEmail = process.env.AUTHORIZED_SERVICE_ACCOUNT_EMAIL;
  console.log(`[INIT] Initializing Firebase Admin with project: gen-lang-client-0653546461${serviceAccountEmail ? ` and service account: ${serviceAccountEmail}` : ''}`);
  
  admin.initializeApp({
    projectId: "gen-lang-client-0653546461",
    serviceAccountId: serviceAccountEmail
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Request and Response logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[SERVER_LOG] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });
    next();
  });

  // API routes FIRST
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "online", 
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      apps: admin.apps.length
    });
  });

  app.post("/api/auth/custom-token", async (req, res) => {
    try {
      const { uid } = req.body;
      console.log(`[AUTH] Handshake request received for UID: ${uid}`);
      
      if (!uid) {
        console.warn("[AUTH] Handshake failed: Missing UID");
        return res.status(400).json({ error: "Identity (UID) is required for handshake" });
      }

      // Ensure admin is initialized
      if (admin.apps.length === 0) {
        console.log("[AUTH] Lazy-initializing Firebase Admin...");
        admin.initializeApp({
          projectId: "gen-lang-client-0653546461",
          serviceAccountId: process.env.AUTHORIZED_SERVICE_ACCOUNT_EMAIL
        });
      }

      console.log(`[AUTH] Generating custom token for: ${uid}`);
      const customToken = await admin.auth().createCustomToken(uid);
      console.log(`[AUTH] Handshake generated successfully for ${uid}`);
      
      return res.status(200).json({ customToken });
    } catch (error: any) {
      console.error("[AUTH] Handshake protocol failure:", error);
      
      // Check for specific permission error
      const isPermissionError = error.message && error.message.includes("permission");
      
      return res.status(500).json({ 
        error: isPermissionError ? "Server Permission Error (signBlob)" : "Handshake negotiation failed",
        details: error.message,
        code: error.code || "UNKNOWN"
      });
    }
  });

  // Specific 404 for API routes to avoid falling through to SPA fallback
  app.all("/api/*", (req, res) => {
    console.warn(`[SERVER] 404 on API route: ${req.method} ${req.url}`);
    res.status(404).json({ error: "API endpoint not found" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Explicit SPA fallback for development to handle deep links correctly
    app.all('*', async (req, res, next) => {
      // Skip if it looks like a file (has an extension) or if it's an API route
      if (req.originalUrl.includes('.') || req.originalUrl.startsWith('/api')) {
        return next();
      }

      console.log(`[DEV] SPA Fallback mapping: ${req.url}`);
      try {
        const templatePath = path.resolve(__dirname_resolved, 'index.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(req.url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // In production, serve the dist folder
    const distPath = path.resolve(__dirname_resolved, 'dist');
    
    // Static files first
    app.use(express.static(distPath, { index: false }));
    
    // SPA fallback: handle all routes by serving index.html
    app.get('*', (req, res) => {
      // Check if file exists in dist, if not, serve index.html
      const possibleFile = path.join(distPath, req.path);
      if (fs.existsSync(possibleFile) && fs.lstatSync(possibleFile).isFile()) {
        return res.sendFile(possibleFile);
      }
      
      console.log(`[PROD] SPA Fallback mapping: ${req.originalUrl}`);
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

startServer();
