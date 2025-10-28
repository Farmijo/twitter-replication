import { ValidationException } from '../../../shared/domain/exceptions/domain.exception';

export class Password {
  private static readonly MIN_LENGTH = 6;

  constructor(private value: string) {
    this.validate();
  }

  public getValue(): string {
    return this.value;
  }

  public update(newValue: string): void {
    this.value = newValue;
    this.validate();
  }

  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new ValidationException('Password cannot be empty');
    }

    if (this.value.length < Password.MIN_LENGTH) {
      throw new ValidationException(`Password must be at least ${Password.MIN_LENGTH} characters long`);
    }
  }
}
