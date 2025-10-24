import { Types } from 'mongoose';
import { Tweet, TweetType, TweetAuthorSnapshot } from '../../../../domain/entities/tweet.entity';
import { TweetId } from '../../../../domain/value-objects/tweet-id.vo';
import { TweetContent } from '../../../../domain/value-objects/tweet-content.vo';
import { UserId } from '../../../../domain/value-objects/user-id.vo';
import { TweetDocument, TweetModel, TweetTypeModel } from '../models/tweet.model';

export class TweetMapper {
  /**
   * Converts a domain Tweet entity to a MongoDB document
   */
  static toPersistence(domainTweet: Tweet): any {
    return {
      _id: new Types.ObjectId(domainTweet.getId().getValue()),
      content: domainTweet.getContent(),
      authorId: new Types.ObjectId(domainTweet.getAuthorId().getValue()),
      type: this.mapDomainTypeToModel(domainTweet.getType()),
      originalTweetId: domainTweet.getOriginalTweetId() 
        ? new Types.ObjectId(domainTweet.getOriginalTweetId()!.getValue()) 
        : null,
      parentTweetId: domainTweet.getParentTweetId() 
        ? new Types.ObjectId(domainTweet.getParentTweetId()!.getValue()) 
        : null,
      likesCount: domainTweet.getLikesCount(),
      retweetsCount: domainTweet.getRetweetsCount(),
      repliesCount: domainTweet.getRepliesCount(),
      hashtags: domainTweet.getHashtags(),
      mentions: domainTweet.getMentions(),
      createdAt: domainTweet.getCreatedAt(),
      isDeleted: false
    };
  }

  /**
   * Converts a MongoDB document to a domain Tweet entity
   */
  static toDomain(persistenceModel: any): Tweet {
    const id = TweetId.fromString(persistenceModel._id?.toString() || persistenceModel.id);
    const content = new TweetContent(persistenceModel.content);
    const rawAuthor = persistenceModel.authorId ?? persistenceModel.userId;
    if (!rawAuthor) {
      throw new Error('Tweet persistence model is missing author reference');
    }

  const authorIdValue = this.extractIdValue(rawAuthor);
  const userId = UserId.fromString(authorIdValue);
  const authorSnapshot = this.buildAuthorSnapshot(rawAuthor, authorIdValue);
    
    const type = this.mapModelTypeToDomain(persistenceModel.type);
    
    // Handle populated originalTweetId
    let originalTweetId = null;
    if (persistenceModel.originalTweetId) {
      const originalTweetIdValue = typeof persistenceModel.originalTweetId === 'object' && persistenceModel.originalTweetId !== null
        ? (persistenceModel.originalTweetId._id?.toString() || persistenceModel.originalTweetId.id)
        : persistenceModel.originalTweetId.toString();
      originalTweetId = TweetId.fromString(originalTweetIdValue);
    }
    
    // Handle populated parentTweetId
    let parentTweetId = null;
    if (persistenceModel.parentTweetId) {
      const parentTweetIdValue = typeof persistenceModel.parentTweetId === 'object' && persistenceModel.parentTweetId !== null
        ? (persistenceModel.parentTweetId._id?.toString() || persistenceModel.parentTweetId.id)
        : persistenceModel.parentTweetId.toString();
      parentTweetId = TweetId.fromString(parentTweetIdValue);
    }

    return new Tweet(
      id,
      content,
      userId,
      type,
      originalTweetId,
      parentTweetId,
      persistenceModel.createdAt,
      persistenceModel.likesCount || 0,
      persistenceModel.retweetsCount || 0,
      persistenceModel.repliesCount || 0,
      authorSnapshot
    );
  }

  /**
   * Converts multiple MongoDB documents to domain Tweet entities
   */
  static toDomainArray(persistenceModels: TweetDocument[]): Tweet[] {
    return persistenceModels.map(model => this.toDomain(model));
  }

  /**
   * Maps domain TweetType to MongoDB TweetTypeModel
   */
  private static mapDomainTypeToModel(domainType: TweetType): TweetTypeModel {
    switch (domainType) {
      case TweetType.ORIGINAL:
        return TweetTypeModel.ORIGINAL;
      case TweetType.RETWEET:
        return TweetTypeModel.RETWEET;
      case TweetType.REPLY:
        return TweetTypeModel.REPLY;
      default:
        throw new Error(`Unknown tweet type: ${domainType}`);
    }
  }

  /**
   * Maps MongoDB TweetTypeModel to domain TweetType
   */
  private static mapModelTypeToDomain(modelType: TweetTypeModel): TweetType {
    switch (modelType) {
      case TweetTypeModel.ORIGINAL:
        return TweetType.ORIGINAL;
      case TweetTypeModel.RETWEET:
        return TweetType.RETWEET;
      case TweetTypeModel.REPLY:
        return TweetType.REPLY;
      default:
        throw new Error(`Unknown tweet model type: ${modelType}`);
    }
  }

  /**
   * Updates a MongoDB document with changes from a domain entity
   */
  static updatePersistenceFromDomain(
    persistenceModel: TweetDocument, 
    domainTweet: Tweet
  ): void {
    persistenceModel.content = domainTweet.getContent();
    persistenceModel.likesCount = domainTweet.getLikesCount();
    persistenceModel.retweetsCount = domainTweet.getRetweetsCount();
    persistenceModel.repliesCount = domainTweet.getRepliesCount();
    persistenceModel.hashtags = domainTweet.getHashtags();
    persistenceModel.mentions = domainTweet.getMentions();
    persistenceModel.updatedAt = new Date();
  }

  /**
   * Creates MongoDB ObjectId from string
   */
  static toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }

  /**
   * Creates array of MongoDB ObjectIds from string array
   */
  static toObjectIdArray(ids: string[]): Types.ObjectId[] {
    return ids.map(id => new Types.ObjectId(id));
  }

  private static extractIdValue(rawId: any): string {
    if (typeof rawId === 'string') {
      return rawId;
    }

    if (rawId instanceof Types.ObjectId) {
      return rawId.toString();
    }

    if (typeof rawId === 'object' && rawId !== null) {
      if (rawId._id) {
        return rawId._id.toString();
      }

      if (rawId.id) {
        return rawId.id.toString();
      }
    }

    if (typeof rawId?.toString === 'function') {
      return rawId.toString();
    }

    throw new Error('Unable to extract identifier value from persistence model');
  }

  private static buildAuthorSnapshot(rawAuthor: any, fallbackId: string): TweetAuthorSnapshot {
    if (!rawAuthor) {
      return { id: fallbackId };
    }

    if (typeof rawAuthor === 'string' || rawAuthor instanceof Types.ObjectId) {
      return { id: fallbackId };
    }

    if (typeof rawAuthor === 'object' && rawAuthor !== null) {
      if (typeof rawAuthor.toObject === 'function') {
        return this.buildAuthorSnapshot(rawAuthor.toObject(), fallbackId);
      }

      const snapshot: TweetAuthorSnapshot = {
        id: rawAuthor._id?.toString?.() ?? rawAuthor.id?.toString?.() ?? fallbackId,
      };

      if (typeof rawAuthor.username === 'string') {
        snapshot.username = rawAuthor.username;
      }

      if (typeof rawAuthor.displayName === 'string') {
        snapshot.displayName = rawAuthor.displayName;
      }

      if (typeof rawAuthor.profileImage === 'string') {
        snapshot.profileImage = rawAuthor.profileImage;
      }

      return snapshot;
    }

    return { id: fallbackId };
  }
}