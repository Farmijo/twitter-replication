import { Id } from '../../../shared/domain/value-objects/id.vo';
import { Types } from 'mongoose';
import { ValidationException } from '../../../shared/domain/exceptions/domain.exception';

export class UserId extends Id {
  constructor(value: string) {
    super(value);
    this.ensureIsValidObjectId(value);
  }

  public static generate(): UserId {
    return new UserId(new Types.ObjectId().toString());
  }

  public static fromString(value: string): UserId {
    return new UserId(value);
  }

  private ensureIsValidObjectId(value: string): void {
    if (!Types.ObjectId.isValid(value)) {
      throw new ValidationException(`Invalid user identifier: ${value}`);
    }
  }
}
