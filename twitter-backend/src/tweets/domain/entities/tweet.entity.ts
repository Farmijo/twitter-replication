import { TweetId } from '../value-objects/tweet-id.vo';
import { TweetContent } from '../value-objects/tweet-content.vo';
import { UserId } from '../value-objects/user-id.vo';
import { Hashtag } from '../value-objects/hashtag.vo';
import { BusinessRuleException } from '../../../shared/domain/exceptions/domain.exception';

export enum TweetType {
  ORIGINAL = 'original',
  RETWEET = 'retweet',
  REPLY = 'reply'
}

export class Tweet {
  private likesCount: number;
  private retweetsCount: number;
  private repliesCount: number;
  private hashtags: Hashtag[];
  private mentions: string[];

  constructor(
    private readonly id: TweetId,
    private content: TweetContent,
    private readonly authorId: UserId,
    private readonly type: TweetType = TweetType.ORIGINAL,
    private readonly originalTweetId: TweetId | null = null,
    private readonly parentTweetId: TweetId | null = null,
    private readonly createdAt: Date = new Date(),
    likesCount: number = 0,
    retweetsCount: number = 0,
    repliesCount: number = 0
  ) {
    this.likesCount = likesCount;
    this.retweetsCount = retweetsCount;
    this.repliesCount = repliesCount;
    this.hashtags = this.extractHashtags();
    this.mentions = this.extractMentions();
    this.validateBusinessRules();
  }

  // Getters
  public getId(): TweetId {
    return this.id;
  }

  public getContent(): string {
    return this.content.getValue();
  }

  public getAuthorId(): UserId {
    return this.authorId;
  }

  public getType(): TweetType {
    return this.type;
  }

  public getOriginalTweetId(): TweetId | null {
    return this.originalTweetId;
  }

  public getParentTweetId(): TweetId | null {
    return this.parentTweetId;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getLikesCount(): number {
    return this.likesCount;
  }

  public getRetweetsCount(): number {
    return this.retweetsCount;
  }

  public getRepliesCount(): number {
    return this.repliesCount;
  }

  public getHashtags(): string[] {
    return this.hashtags.map(hashtag => hashtag.getValue());
  }

  public getMentions(): string[] {
    return [...this.mentions];
  }

  // Business logic methods
  public updateContent(newContent: string): void {
    if (!this.canBeEdited()) {
      throw new BusinessRuleException('Tweet cannot be edited after 5 minutes');
    }

    if (this.type !== TweetType.ORIGINAL) {
      throw new BusinessRuleException('Only original tweets can be edited');
    }

    this.content = new TweetContent(newContent);
    this.hashtags = this.extractHashtags();
    this.mentions = this.extractMentions();
  }

  public like(): void {
    this.likesCount++;
  }

  public unlike(): void {
    if (this.likesCount > 0) {
      this.likesCount--;
    }
  }

  public incrementRetweetsCount(): void {
    this.retweetsCount++;
  }

  public decrementRetweetsCount(): void {
    if (this.retweetsCount > 0) {
      this.retweetsCount--;
    }
  }

  public incrementRepliesCount(): void {
    this.repliesCount++;
  }

  public decrementRepliesCount(): void {
    if (this.repliesCount > 0) {
      this.repliesCount--;
    }
  }

  public canBeEditedBy(userId: UserId): boolean {
    return this.isOwnedBy(userId) && this.canBeEdited();
  }

  public canBeDeletedBy(userId: UserId): boolean {
    return this.isOwnedBy(userId);
  }

  public canBeRetweetedBy(userId: UserId): boolean {
    return !this.isOwnedBy(userId);
  }

  public isOwnedBy(userId: UserId): boolean {
    return this.authorId.equals(userId);
  }

  public isRetweet(): boolean {
    return this.type === TweetType.RETWEET;
  }

  public isReply(): boolean {
    return this.type === TweetType.REPLY;
  }

  public isOriginal(): boolean {
    return this.type === TweetType.ORIGINAL;
  }

  public hasHashtag(hashtag: string): boolean {
    return this.hashtags.some(h => h.getValue() === hashtag.toLowerCase());
  }

  public hasMention(username: string): boolean {
    return this.mentions.includes(username.toLowerCase());
  }

  private canBeEdited(): boolean {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.createdAt > fiveMinutesAgo;
  }

  private extractHashtags(): Hashtag[] {
    const hashtagStrings = this.content.extractHashtags();
    return hashtagStrings.map(hashtagString => new Hashtag(hashtagString));
  }

  private extractMentions(): string[] {
    return this.content.extractMentions();
  }

  private validateBusinessRules(): void {
    // Retweets must have an original tweet
    if (this.type === TweetType.RETWEET && !this.originalTweetId) {
      throw new BusinessRuleException('Retweets must reference an original tweet');
    }

    // Replies must have a parent tweet
    if (this.type === TweetType.REPLY && !this.parentTweetId) {
      throw new BusinessRuleException('Replies must reference a parent tweet');
    }

    // Original tweets cannot have original or parent tweet IDs
    if (this.type === TweetType.ORIGINAL && (this.originalTweetId || this.parentTweetId)) {
      throw new BusinessRuleException('Original tweets cannot reference other tweets');
    }

    // Cannot retweet your own tweet (this would be validated at application level)
    // Cannot reply to non-existent tweet (this would be validated at application level)
  }

  // Factory methods
  public static createOriginalTweet(
    id: TweetId,
    content: TweetContent,
    authorId: UserId
  ): Tweet {
    return new Tweet(id, content, authorId, TweetType.ORIGINAL);
  }

  public static createRetweet(
    id: TweetId,
    content: TweetContent,
    authorId: UserId,
    originalTweetId: TweetId
  ): Tweet {
    return new Tweet(id, content, authorId, TweetType.RETWEET, originalTweetId);
  }

  public static createReply(
    id: TweetId,
    content: TweetContent,
    authorId: UserId,
    parentTweetId: TweetId
  ): Tweet {
    return new Tweet(id, content, authorId, TweetType.REPLY, null, parentTweetId);
  }
}