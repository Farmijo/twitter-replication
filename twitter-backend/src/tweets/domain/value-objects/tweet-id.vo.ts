import { Id } from '../../../shared/domain/value-objects/id.vo';

export class TweetId extends Id {
  constructor(value: string) {
    super(value);
  }

  public static generate(): TweetId {
    return new TweetId(Id.generateUUID());
  }

  public static fromString(value: string): TweetId {
    return new TweetId(value);
  }
}