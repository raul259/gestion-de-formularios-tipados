import { Router } from "express";
import { container } from "../container.js";
import { validateComponentPayload } from "../middleware/validate-component.middleware.js";

export const componentRouter = Router();

componentRouter.get("/", container.componentController.list);
componentRouter.post("/", validateComponentPayload, container.componentController.create);
componentRouter.put("/:id", validateComponentPayload, container.componentController.update);
componentRouter.delete("/:id", container.componentController.remove);
