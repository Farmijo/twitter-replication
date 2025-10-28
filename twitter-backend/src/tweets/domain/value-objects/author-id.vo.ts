import { Id } from '../../../shared/domain/value-objects/id.vo';
import { Types } from 'mongoose';

export class AuthorId extends Id {
  constructor(value: string) {
    super(value);
  }

  public static generate(): AuthorId {
    return new AuthorId(new Types.ObjectId().toString());
  }

  public static fromString(value: string): AuthorId {
    return new AuthorId(value);
  }
}
