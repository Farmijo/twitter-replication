import { Id } from '../../../shared/domain/value-objects/id.vo';
import { Types } from 'mongoose';

export class TweetId extends Id {
  constructor(value: string) {
    super(value);
  }

  public static generate(): TweetId {
    return new TweetId(new Types.ObjectId().toString());
  }

  public static fromString(value: string): TweetId {
    return new TweetId(value);
  }
}