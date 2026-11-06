import mongoose from "mongoose";
import { TGenericErrorResponse } from "../interface/error";

// Raised by Mongoose when a value cannot be cast (most often an invalid id).
const handleCastError = (
  err: mongoose.Error.CastError,
): TGenericErrorResponse => {
  return {
    message: `Invalid value for ${err.path}`,
    errorSources: [{ path: err.path, message: `Invalid ${err.kind}` }],
  };
};

export default handleCastError;
