export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

export class NotFoundDomainException extends DomainException {
  constructor(resource: string, id?: string) {
    super(id ? `${resource} with id ${id} not found` : `${resource} not found`);
  }
}

export class BusinessRuleException extends DomainException {
  constructor(message: string) {
    super(`Business rule violation: ${message}`);
  }
}