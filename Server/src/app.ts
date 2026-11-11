import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import helmet from "helmet";
import config from "./app/config";
import { connectDatabase, isDatabaseConnected } from "./app/config/db";
import "./app/interface/express";
import router from "./app/routes";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import notFoundHandler from "./middlewares/notFoundHandler";
import { ConfigLimiter } from "./middlewares/RateLimiter/CreateRateLimiter";
import requestLogger from "./middlewares/requestLogger";
import requireDb from "./middlewares/requireDb";

const app = express();

app.disable("x-powered-by");

// Number of trusted reverse proxies (Vercel = 1) so req.ip is the real client
const trustProxy = Number(config.trust_proxy);
app.set("trust proxy", Number.isNaN(trustProxy) ? config.trust_proxy : trustProxy);

// "simple" parser: `?a[b]=c` stays the literal key "a[b]" instead of becoming
// a nested object - this blocks query-string operator injection.
app.set("query parser", "simple");

// Security headers suitable for a JSON API
app.use(helmet());

// parser
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(cookieParser());

// Browsers normally reach the API through the Next.js same-origin proxy, so
// CORS only matters for direct calls. Only configured origins are allowed.
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.client_origins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  }),
);

app.use(requestLogger);

// API responses are never cached by browsers or CDNs; page caching happens
// in Next.js, which revalidates when content changes.
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// Health check - reports database state without exposing any details.
// Tries to connect first: on a serverless cold start nothing has connected yet.
app.get("/api/health", async (req: Request, res: Response) => {
  await connectDatabase().catch(() => undefined);
  res.status(isDatabaseConnected() ? 200 : 503).json({
    success: isDatabaseConnected(),
    status: isDatabaseConnected() ? "ok" : "degraded",
    database: isDatabaseConnected() ? "connected" : "disconnected",
    uptimeSeconds: Math.round(process.uptime()),
  });
});

// Apply global rate limiter to all API routes (after the DB is available,
// because the limiter stores counters in MongoDB)
app.use("/api", requireDb, ConfigLimiter.global);

app.use("/api/", router);

app.get("/", (req: Request, res: Response) => {
  res.send("SH Digital Studio API");
});

// ErrorHandler
app.use(globalErrorHandler);
// notFound
app.use(notFoundHandler);

export default app;
