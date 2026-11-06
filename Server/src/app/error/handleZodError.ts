import { ZodError, ZodIssue } from "zod";
import { TErrorSources, TGenericErrorResponse } from "../interface/error";

const handleZodError = (err: ZodError): TGenericErrorResponse => {
  const errorSources: TErrorSources = err.issues.map((issue: ZodIssue) => {
    // Drop the leading "body"/"query"/"params" segment added by
    // validateRequest so the path matches the form field name, while keeping
    // nested paths readable (e.g. "seo.title", "features.2.title").
    const segments = issue.path.slice(
      ["body", "query", "params"].includes(String(issue.path[0])) ? 1 : 0,
    );
    return {
      path: segments.join(".") || String(issue.path[issue.path.length - 1]),
      message: issue.message,
    };
  });

  return {
    message: errorSources[0]?.message
      ? `Validation Error: ${errorSources[0].path ? `${errorSources[0].path} - ` : ""}${errorSources[0].message}`
      : "Validation Error",
    errorSources,
  };
};

export default handleZodError;
