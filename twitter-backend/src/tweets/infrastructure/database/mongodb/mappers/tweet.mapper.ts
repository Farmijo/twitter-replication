import { Types } from 'mongoose';
import { Tweet, TweetType } from '../../../../domain/entities/tweet.entity';
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
  static toDomain(persistenceModel: TweetDocument): Tweet {
    const id = TweetId.fromString(persistenceModel._id.toString());
    const content = new TweetContent(persistenceModel.content);
    const authorId = UserId.fromString(persistenceModel.authorId.toString());
    const type = this.mapModelTypeToDomain(persistenceModel.type);
    
    const originalTweetId = persistenceModel.originalTweetId 
      ? TweetId.fromString(persistenceModel.originalTweetId.toString())
      : null;
    
    const parentTweetId = persistenceModel.parentTweetId 
      ? TweetId.fromString(persistenceModel.parentTweetId.toString())
      : null;

    return new Tweet(
      id,
      content,
      authorId,
      type,
      originalTweetId,
      parentTweetId,
      persistenceModel.createdAt,
      persistenceModel.likesCount || 0,
      persistenceModel.retweetsCount || 0,
      persistenceModel.repliesCount || 0
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
}