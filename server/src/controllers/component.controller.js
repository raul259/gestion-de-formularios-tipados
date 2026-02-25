export class ComponentController {
  constructor(service) {
    this.service = service;
  }

  list = (_req, res) => {
    res.json({ status: "success", data: this.service.list() });
  };

  create = (req, res) => {
    const created = this.service.create(req.validatedDraft);
    res.status(201).json({ status: "success", data: created });
  };

  update = (req, res) => {
    const updated = this.service.update(req.params.id, req.validatedDraft);
    res.json({ status: "success", data: updated });
  };

  remove = (req, res) => {
    this.service.delete(req.params.id);
    res.status(204).send();
  };
}
