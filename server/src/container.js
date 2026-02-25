import { ComponentRepository } from "./repositories/component.repository.js";
import { ComponentService } from "./services/component.service.js";
import { ComponentController } from "./controllers/component.controller.js";

const componentRepository = new ComponentRepository();
const componentService = new ComponentService(componentRepository);
const componentController = new ComponentController(componentService);

export const container = {
  componentController,
};
