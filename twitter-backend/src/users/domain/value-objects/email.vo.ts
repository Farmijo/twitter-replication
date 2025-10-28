import { ValidationException } from '../../../shared/domain/exceptions/domain.exception';

export class Email {
  private static readonly EMAIL_REGEX = /^[\w.+-]+@[\w-]+\.[\w.-]+$/i;

  constructor(private readonly value: string) {
    this.validate();
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Email): boolean {
    return this.value.toLowerCase() === other.getValue().toLowerCase();
  }

  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new ValidationException('Email cannot be empty');
    }

    if (!Email.EMAIL_REGEX.test(this.value)) {
      throw new ValidationException('Email format is invalid');
    }
  }
}
