import { validateComponentDraft } from "../validation/component.validation.js";

export const validateComponentPayload = (req, _res, next) => {
  req.validatedDraft = validateComponentDraft(req.body);
  next();
};
