import cors from "cors";
import express from "express";
import helmet from "helmet";
import { healthRouter } from "./routes/health.routes.js";
import { componentRouter } from "./routes/component.routes.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

export const buildApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.use("/api/health", healthRouter);
  app.use("/api/components", componentRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
