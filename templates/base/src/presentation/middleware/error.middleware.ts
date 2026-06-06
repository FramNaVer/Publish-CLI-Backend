import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof ZodError) {
        res.status(400).json({ message: "Validation error", errors: err.errors });
        return;
    }
    console.error(err);
    res.status(500).json({ message: err.message ?? "Internal server error" });
};
