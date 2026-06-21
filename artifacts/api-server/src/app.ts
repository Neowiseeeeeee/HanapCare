import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Trust the first proxy hop (Replit's reverse proxy / Render's load balancer)
// This is required for express-rate-limit to read X-Forwarded-For correctly
app.set("trust proxy", 1);

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5000", "http://localhost:5173"];

// Render automatically sets RENDER_EXTERNAL_URL — always allow it
const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL?.replace(/\/$/, "");
if (RENDER_EXTERNAL_URL && !ALLOWED_ORIGINS.includes(RENDER_EXTERNAL_URL)) {
  ALLOWED_ORIGINS.push(RENDER_EXTERNAL_URL);
}

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  }),
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        ALLOWED_ORIGINS.some((o) => origin.startsWith(o)) ||
        origin.includes("neon.tech") ||
        origin.includes(".replit.dev") ||
        origin.includes(".replit.app") ||
        origin.includes(".onrender.com") ||
        process.env.NODE_ENV === "development"
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many attempts, please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: { error: "Too many requests, please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.use("/api/auth", authLimiter);
app.use("/api", generalLimiter);
app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const staticDir = path.resolve(__dirname, "../../hanapcare/dist/public");

  if (existsSync(staticDir)) {
    app.use(express.static(staticDir));
    app.get(/(.*)/, (_req, res) => {
      res.sendFile(path.join(staticDir, "index.html"));
    });
  } else {
    logger.warn({ staticDir }, "Frontend static files not found — skipping static serving");
  }
}

export default app;
