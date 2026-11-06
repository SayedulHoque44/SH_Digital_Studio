import { NextFunction, Request, Response } from "express";
import { logger } from "../app/utils/logger";

/**
 * Minimal access log: method, path (without the query string, which may hold
 * personal data such as e-mail search terms), status and duration. Request
 * bodies, cookies and headers are never logged.
 */
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    // originalUrl: req.path is relative to the router that handled the request
    const path = req.originalUrl.split("?")[0];
    if (path === "/api/health") return;
    const message = `${req.method} ${path} ${res.statusCode} ${Date.now() - start}ms`;
    if (res.statusCode >= 500) logger.error(message);
    else if (res.statusCode >= 400) logger.warn(message);
    else logger.info(message);
  });
  next();
};

export default requestLogger;
