import { randomUUID } from "node:crypto";

export class ComponentRepository {
  #items = [];

  findAll() {
    return [...this.#items];
  }

  findBySku(sku) {
    return this.#items.find((item) => item.sku === sku) ?? null;
  }

  create(draft) {
    const item = { id: randomUUID(), ...draft };
    this.#items.push(item);
    return item;
  }

  updateById(id, draft) {
    const index = this.#items.findIndex((item) => item.id === id);
    if (index < 0) {
      return null;
    }

    const updated = { id, ...draft };
    this.#items[index] = updated;
    return updated;
  }

  deleteById(id) {
    const previousLength = this.#items.length;
    this.#items = this.#items.filter((item) => item.id !== id);
    return this.#items.length < previousLength;
  }
}
