import { Id } from '../../../shared/domain/value-objects/id.vo';
import { Types } from 'mongoose';

export class UserId extends Id {
  constructor(value: string) {
    super(value);
  }

  public static generate(): UserId {
    return new UserId(new Types.ObjectId().toString());
  }

  public static fromString(value: string): UserId {
    return new UserId(value);
  }
}