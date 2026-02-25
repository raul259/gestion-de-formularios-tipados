import { NotFoundError, ValidationError } from "../utils/errors.js";

export class ComponentService {
  constructor(repository) {
    this.repository = repository;
  }

  list() {
    return this.repository.findAll();
  }

  create(draft) {
    const existing = this.repository.findBySku(draft.sku);
    if (existing !== null) {
      throw new ValidationError("Ya existe un componente con ese SKU");
    }
    return this.repository.create(draft);
  }

  update(id, draft) {
    const existing = this.repository.findBySku(draft.sku);
    if (existing !== null && existing.id !== id) {
      throw new ValidationError("Ya existe un componente con ese SKU");
    }
    const updated = this.repository.updateById(id, draft);
    if (updated === null) {
      throw new NotFoundError("Componente no encontrado");
    }
    return updated;
  }

  delete(id) {
    const removed = this.repository.deleteById(id);
    if (!removed) {
      throw new NotFoundError("Componente no encontrado");
    }
  }
}
