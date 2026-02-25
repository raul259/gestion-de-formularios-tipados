import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    status: "success",
    data: {
      service: "form-backend",
      timestamp: new Date().toISOString(),
    },
  });
});
