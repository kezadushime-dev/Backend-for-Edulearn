import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const validate =
  (schema: any) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
    });

    if (error) {
      const messages = error.details.map((d: any) => d.message);

      return next(new AppError(messages.join(", "), 400));
    }

    next();
  };