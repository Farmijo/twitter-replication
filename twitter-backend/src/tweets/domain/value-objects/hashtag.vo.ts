import { ValidationException } from '../../../shared/domain/exceptions/domain.exception';

export class Hashtag {
  private static readonly MAX_LENGTH = 100;
  private static readonly MIN_LENGTH = 1;

  constructor(private readonly value: string) {
    this.validate();
  }

  public getValue(): string {
    return this.value.toLowerCase();
  }

  public equals(other: Hashtag): boolean {
    return this.getValue() === other.getValue();
  }

  public toString(): string {
    return `#${this.getValue()}`;
  }

  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new ValidationException('Hashtag cannot be empty');
    }

    const trimmedValue = this.value.trim();

    if (trimmedValue.length < Hashtag.MIN_LENGTH) {
      throw new ValidationException(`Hashtag must be at least ${Hashtag.MIN_LENGTH} character long`);
    }

    if (trimmedValue.length > Hashtag.MAX_LENGTH) {
      throw new ValidationException(`Hashtag exceeds ${Hashtag.MAX_LENGTH} characters`);
    }

    // Only allow alphanumeric characters and underscores
    const validHashtagRegex = /^[a-zA-Z0-9_]+$/;
    if (!validHashtagRegex.test(trimmedValue)) {
      throw new ValidationException('Hashtag can only contain letters, numbers, and underscores');
    }
  }
}