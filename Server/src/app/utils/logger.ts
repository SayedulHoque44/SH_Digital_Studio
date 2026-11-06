/* eslint-disable no-console */
import config from "../config";

type TLogMeta = Record<string, unknown>;

// Strips anything that looks like credentials before it reaches the logs.
const REDACT_KEYS = /pass(word)?|token|secret|authorization|cookie|key/i;

const redact = (meta?: TLogMeta) => {
  if (!meta) return undefined;
  return Object.fromEntries(
    Object.entries(meta).map(([key, value]) => [
      key,
      REDACT_KEYS.test(key) ? "[redacted]" : value,
    ]),
  );
};

const write = (
  level: "info" | "warn" | "error",
  message: string,
  meta?: TLogMeta,
) => {
  const safeMeta = redact(meta);
  if (config.isProduction) {
    // One JSON line per entry keeps hosted log viewers searchable.
    console[level](
      JSON.stringify({
        level,
        time: new Date().toISOString(),
        message,
        ...safeMeta,
      }),
    );
    return;
  }
  console[level](
    `[${new Date().toLocaleTimeString()}] ${level.toUpperCase()} ${message}`,
    safeMeta ? safeMeta : "",
  );
};

export const logger = {
  info: (message: string, meta?: TLogMeta) => write("info", message, meta),
  warn: (message: string, meta?: TLogMeta) => write("warn", message, meta),
  error: (message: string, meta?: TLogMeta) => write("error", message, meta),
};
