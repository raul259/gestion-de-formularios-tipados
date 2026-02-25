import { AppError } from "../utils/errors.js";

export const errorHandler = (error, req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: "error",
      message: error.message,
      details: error.details,
    });
    return;
  }

  console.error("Unhandled server error", {
    method: req.method,
    path: req.originalUrl,
    message: error?.message,
    stack: error?.stack,
  });

  res.status(500).json({
    status: "error",
    message: "Error interno del servidor",
  });
};
