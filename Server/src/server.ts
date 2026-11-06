import { Server } from "http";
import app from "./app";
import config from "./app/config";
import { connectDatabase, disconnectDatabase } from "./app/config/db";
import { logger } from "./app/utils/logger";

let server: Server;

async function main() {
  // Start accepting requests immediately. If the database is not reachable
  // yet, API routes answer 503 (see middlewares/requireDb) and every request
  // retries the connection, instead of the process crashing or never
  // listening (which made outages hard to diagnose before).
  server = app.listen(config.port, () => {
    logger.info(`SH Digital Studio API listening on port ${config.port}`);
  });

  try {
    await connectDatabase();
  } catch (error: any) {
    logger.error("Initial database connection failed - will retry on demand", {
      error: error?.message,
    });
  }
}

main();

const shutdown = (signal: string) => {
  logger.info(`${signal} received, closing server`);
  server?.close(async () => {
    await disconnectDatabase().catch(() => undefined);
    process.exit(0);
  });
  // Force exit if connections do not close in time
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Log unexpected errors with context; keep serving other requests.
process.on("unhandledRejection", err => {
  logger.error("Unhandled promise rejection", { error: (err as Error)?.message });
});

process.on("uncaughtException", err => {
  logger.error("Uncaught exception", { error: err?.message, stack: err?.stack });
});
