import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Proxy for GitHub API to avoid CORS issues
  app.get("/api/github/sites", async (req, res) => {
    try {
      const GITHUB_API_URL = 'https://api.github.com/repos/8BitSensei/Templum-Data/contents/data/sites?ref=gh-pages';
      const response = await fetch(GITHUB_API_URL, {
        headers: {
          'User-Agent': 'Templum-App'
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`GitHub API error (${response.status}): ${errorText}`);
        return res.status(response.status).json({ error: "Failed to fetch from GitHub" });
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error in /api/github/sites:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/github/dates", async (req, res) => {
    try {
      const DATES_METADATA_URL = 'https://raw.githubusercontent.com/8BitSensei/Templum-Data/gh-pages/data/metadata/dates.json';
      const response = await fetch(DATES_METADATA_URL, {
        headers: {
          'User-Agent': 'Templum-App'
        }
      });
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch from GitHub" });
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error in /api/github/dates:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/github/raw", async (req, res) => {
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ error: "URL is required" });
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Templum-App'
        }
      });
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch from GitHub" });
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error in /api/github/raw:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
