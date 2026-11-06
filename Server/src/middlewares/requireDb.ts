import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { connectDatabase } from "../app/config/db";
import { logger } from "../app/utils/logger";

/**
 * Ensures a database connection before API handlers run. On a cold start this
 * waits for the shared connection promise; if the database is unreachable the
 * client receives a clear 503 instead of a hanging request or a crash.
 */
const requireDb = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDatabase();
    next();
  } catch (error: any) {
    logger.error("Database unavailable", { error: error?.message });
    res.status(httpStatus.SERVICE_UNAVAILABLE).json({
      success: false,
      message: "Service temporarily unavailable. Please try again shortly.",
      errorSources: [],
    });
  }
};

export default requireDb;
