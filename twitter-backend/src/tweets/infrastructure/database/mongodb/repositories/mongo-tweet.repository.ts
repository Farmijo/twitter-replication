import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tweet } from '../../../../domain/entities/tweet.entity';
import { TweetRepository } from '../../../../domain/repositories/tweet.repository';
import { TweetId } from '../../../../domain/value-objects/tweet-id.vo';
import { UserId } from '../../../../domain/value-objects/user-id.vo';
import { TweetModel } from '../models/tweet.model';
import { TweetMapper } from '../mappers/tweet.mapper';

@Injectable()
export class MongoTweetRepository implements TweetRepository {
  constructor(
    @InjectModel('Tweet')
    private readonly tweetModel: Model<TweetModel>,
  ) {}

  /**
   * Transforma los campos populate para usar 'id' en lugar de '_id'
   */
  private transformPopulatedFields(doc: any): any {
    const obj = doc.toObject();
    
    // Transformar el documento principal
    if (obj._id) {
      obj.id = obj._id;
      delete obj._id;
      delete obj.__v;
    }
    
    // Transformar authorId si está populated
    if (obj.authorId && typeof obj.authorId === 'object' && obj.authorId._id) {
      obj.authorId.id = obj.authorId._id;
      delete obj.authorId._id;
      delete obj.authorId.__v;
    }
    
    // Transformar originalTweetId si está populated
    if (obj.originalTweetId && typeof obj.originalTweetId === 'object' && obj.originalTweetId._id) {
      obj.originalTweetId.id = obj.originalTweetId._id;
      delete obj.originalTweetId._id;
      delete obj.originalTweetId.__v;
      
      // Transformar también el authorId del originalTweetId si está populated
      if (obj.originalTweetId.authorId && typeof obj.originalTweetId.authorId === 'object' && obj.originalTweetId.authorId._id) {
        obj.originalTweetId.authorId.id = obj.originalTweetId.authorId._id;
        delete obj.originalTweetId.authorId._id;
        delete obj.originalTweetId.authorId.__v;
      }
    }

    // Transformar replyTo si está populated (para replies)
    if (obj.replyTo && typeof obj.replyTo === 'object' && obj.replyTo._id) {
      obj.replyTo.id = obj.replyTo._id;
      delete obj.replyTo._id;
      delete obj.replyTo.__v;
    }
    
    return obj;
  }

  async save(tweet: Tweet): Promise<Tweet> {
    const tweetDoc = TweetMapper.toPersistence(tweet);
    const savedDoc = await this.tweetModel.create(tweetDoc);
    const populatedDoc = await savedDoc.populate('authorId', 'username displayName profileImage');
    return TweetMapper.toDomain(populatedDoc);
  }

  async findById(id: TweetId): Promise<Tweet | null> {
    const doc = await this.tweetModel
      .findById(id.getValue())
      .populate('authorId', 'username displayName profileImage')
      .populate({
        path: 'originalTweetId',
        populate: {
          path: 'authorId',
          select: 'username displayName profileImage'
        }
      })
      .exec();
    
    return doc ? TweetMapper.toDomain(doc) : null;
  }

  async findByIds(ids: TweetId[]): Promise<Tweet[]> {
    const idStrings = ids.map(id => id.getValue());
    const docs = await this.tweetModel
      .find({ _id: { $in: idStrings } })
  .populate('authorId', 'username displayName profileImage')
      .exec();
    
    return docs.map(doc => TweetMapper.toDomain(doc));
  }

  async update(tweet: Tweet): Promise<Tweet> {
    const tweetDoc = TweetMapper.toPersistence(tweet);
    const updatedDoc = await this.tweetModel
      .findByIdAndUpdate(tweet.getId().getValue(), tweetDoc, { new: true })
  .populate('authorId', 'username displayName profileImage')
      .exec();
    
    if (!updatedDoc) {
      throw new Error(`Tweet with id ${tweet.getId().getValue()} not found`);
    }
    
    return TweetMapper.toDomain(updatedDoc);
  }

  async delete(id: TweetId): Promise<void> {
    await this.tweetModel.findByIdAndDelete(id.getValue()).exec();
  }

  async findByAuthor(authorId: UserId): Promise<Tweet[]> {
    const filters = this.buildAuthorFilters(authorId);
    const docs = await this.tweetModel
      .find(filters.length ? { $or: filters } : { authorId: authorId.getValue() })
      .populate('authorId', 'username displayName profileImage')
      .sort({ createdAt: -1 })
      .exec();

    return docs.map(doc => TweetMapper.toDomain(doc));
  }

  async findRepliesTo(tweetId: TweetId): Promise<Tweet[]> {
    const docs = await this.tweetModel
      .find({ parentTweetId: tweetId.getValue() })
  .populate('authorId', 'username displayName profileImage')
      .sort({ createdAt: 1 })
      .exec();
    
    return docs.map(doc => TweetMapper.toDomain(doc));
  }

  async findRecent(limit: number, skip = 0): Promise<Tweet[]> {
    const docs = await this.tweetModel
      .find()
      .populate({
        path: 'authorId',
        select: 'username displayName profileImage'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return docs.map(doc => TweetMapper.toDomain(doc));
  }

  private buildAuthorFilters(authorId: UserId): Record<string, unknown>[] {
    const rawValue = authorId.getValue()?.trim();
    if (!rawValue) {
      return [];
    }

    const variants = new Set<string>();
    variants.add(rawValue);

    const extractedHex = this.extractHexObjectId(rawValue);
    if (extractedHex) {
      variants.add(extractedHex);
    }

    const filters: Record<string, unknown>[] = [];

    for (const value of variants) {
      filters.push({ authorId: value });
      if (Types.ObjectId.isValid(value)) {
        filters.push({ authorId: new Types.ObjectId(value) });
      }
      // Compatibilidad con documentos legacy
      filters.push({ userId: value });
      if (Types.ObjectId.isValid(value)) {
        filters.push({ userId: new Types.ObjectId(value) });
      }
    }

    return filters;
  }

  private extractHexObjectId(value: string): string | null {
    const objectIdMatch = value.match(/ObjectId\("([0-9a-fA-F]{24})"\)/);
    if (objectIdMatch && objectIdMatch[1]) {
      return objectIdMatch[1];
    }

    const hexMatch = value.match(/([0-9a-fA-F]{24})/);
    return hexMatch ? hexMatch[1] : null;
  }
}