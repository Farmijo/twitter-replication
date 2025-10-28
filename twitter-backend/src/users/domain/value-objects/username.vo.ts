import { ValidationException } from '../../../shared/domain/exceptions/domain.exception';

export class Username {
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 30;
  private static readonly VALID_PATTERN = /^[a-zA-Z0-9_]+$/;

  constructor(private readonly value: string) {
    this.validate();
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Username): boolean {
    return this.value === other.getValue();
  }

  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new ValidationException('Username cannot be empty');
    }

    if (this.value.length < Username.MIN_LENGTH) {
      throw new ValidationException(`Username must be at least ${Username.MIN_LENGTH} characters long`);
    }

    if (this.value.length > Username.MAX_LENGTH) {
      throw new ValidationException(`Username must be at most ${Username.MAX_LENGTH} characters long`);
    }

    if (!Username.VALID_PATTERN.test(this.value)) {
      throw new ValidationException('Username must contain only letters, numbers or underscores');
    }
  }
}
