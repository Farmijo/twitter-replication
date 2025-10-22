import { randomUUID } from 'crypto';

export abstract class Id {
  constructor(private readonly value: string) {
    this.validate();
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Id): boolean {
    return this.value === other.getValue();
  }

  public toString(): string {
    return this.value;
  }

  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new Error('ID cannot be empty');
    }
  }

  protected static generateUUID(): string {
    return randomUUID().toString();
  }
}