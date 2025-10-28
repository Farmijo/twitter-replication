import { Tweet } from '../entities/tweet.entity';
import { TweetId } from '../value-objects/tweet-id.vo';
import { AuthorId } from '../value-objects/author-id.vo';

/**
 * Repository interface following hexagonal architecture principles.
 * Contains only basic CRUD operations and simple domain queries.
 * Complex queries are handled by application services.
 */
export abstract class TweetRepository {
  abstract save(tweet: Tweet): Promise<Tweet>;
  abstract findById(id: TweetId): Promise<Tweet | null>;
  abstract findByIds(ids: TweetId[]): Promise<Tweet[]>;
  abstract update(tweet: Tweet): Promise<Tweet>;
  abstract delete(id: TweetId): Promise<void>;
  abstract findByAuthor(authorId: AuthorId): Promise<Tweet[]>;
  abstract findRepliesTo(tweetId: TweetId): Promise<Tweet[]>;
  abstract findRecent(limit: number, skip?: number): Promise<Tweet[]>;
}