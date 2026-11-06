import { ErrorRequestHandler } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import config from "../app/config";
import AppError from "../app/error/AppError";
import handleCastError from "../app/error/handleCastError";
import { handleDupliacteError } from "../app/error/handleDuplicateError";
import handleValidationError from "../app/error/handleValidationError";
import handleZodError from "../app/error/handleZodError";
import { TErrorSources } from "../app/interface/error";
import { logger } from "../app/utils/logger";

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  //setting default values
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong!";
  let errorSources: TErrorSources = [
    {
      path: "",
      message: "Something went wrong",
    },
  ];

  // handle multiple type error
  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
    statusCode = httpStatus.BAD_REQUEST;
  } else if (err?.name === "ValidationError") {
    const simplifiedError = handleValidationError(err);
    statusCode = httpStatus.BAD_REQUEST;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err?.name === "CastError") {
    const simplifiedError = handleCastError(err);
    statusCode = httpStatus.BAD_REQUEST;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err instanceof AppError) {
    message = err.message;
    statusCode = err.statusCode;
    errorSources = [{ path: "", message: err.message }];
  } else if (err?.code === 11000) {
    statusCode = httpStatus.CONFLICT;
    message = handleDupliacteError(err);
    errorSources = [{ path: Object.keys(err?.keyValue || {})[0] || "", message }];
  } else if (err?.type === "entity.parse.failed") {
    // Malformed JSON body (thrown by express.json)
    statusCode = httpStatus.BAD_REQUEST;
    message = "Malformed request body";
    errorSources = [{ path: "", message }];
  } else if (err?.type === "entity.too.large") {
    statusCode = httpStatus.REQUEST_ENTITY_TOO_LARGE;
    message = "Request body is too large";
    errorSources = [{ path: "", message }];
  }

  if (statusCode >= 500) {
    // Full details stay in the server logs; clients only get a safe message.
    logger.error("Unhandled error", {
      method: req.method,
      path: req.path,
      error: err?.message,
      stack: config.isProduction ? undefined : err?.stack,
    });
  }

  //ultimate return - never leak the raw error object, and only include the
  // stack trace while developing locally.
  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    ...(config.node_env === "development" && statusCode >= 500
      ? { stack: err?.stack }
      : {}),
  });
};

export default globalErrorHandler;
