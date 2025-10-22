import { Id } from '../../../shared/domain/value-objects/id.vo';

export class UserId extends Id {
  constructor(value: string) {
    super(value);
  }

  public static generate(): UserId {
    return new UserId(Id.generateUUID());
  }

  public static fromString(value: string): UserId {
    return new UserId(value);
  }
}