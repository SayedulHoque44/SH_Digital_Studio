import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";
import catchAsync from "../app/utils/catchAsync";

/**
 * Validates `{ body, query, params }` against a Zod schema and replaces the
 * request values with the parsed result.
 *
 * Replacing (not just checking) matters for security: Zod strips unknown keys,
 * so a client cannot mass-assign fields the schema does not declare (for
 * example `internalNotes` on a public endpoint or `passwordHash` on an admin
 * one), and values are coerced to the declared types.
 */
const validateRequest = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (parsed.body !== undefined) req.body = parsed.body;
    if (parsed.query !== undefined) req.query = parsed.query;
    if (parsed.params !== undefined) req.params = parsed.params;

    next();
  });
};

export default validateRequest;
