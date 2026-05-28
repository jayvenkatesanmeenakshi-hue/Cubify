import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes FIRST
  app.use(express.json());

  app.post("/api/auth/custom-token", async (req, res) => {
    const { uid } = req.body;
    if (!uid) {
      return res.status(400).json({ error: "UID is required" });
    }

    try {
      const { default: admin } = await import("firebase-admin");
      
      // Initialize admin if not already initialized
      if (admin.apps.length === 0) {
        admin.initializeApp({
          projectId: "gen-lang-client-0653546461",
        });
      }

      const customToken = await admin.auth().createCustomToken(uid);
      res.json({ customToken });
    } catch (error) {
      console.error("Error generating custom token:", error);
      res.status(500).json({ error: "Failed to generate custom token" });
    }
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
        const templatePath = path.resolve(process.cwd(), 'index.html');
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
    const distPath = path.resolve(process.cwd(), 'dist');
    
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
