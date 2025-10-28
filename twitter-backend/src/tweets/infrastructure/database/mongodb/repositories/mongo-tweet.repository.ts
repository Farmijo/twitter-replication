import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tweet } from '../../../../domain/entities/tweet.entity';
import { TweetRepository } from '../../../../domain/repositories/tweet.repository';
import { TweetId } from '../../../../domain/value-objects/tweet-id.vo';
import { AuthorId } from '../../../../domain/value-objects/author-id.vo';
import { TweetModel, TweetTypeModel } from '../models/tweet.model';
import { TweetMapper } from '../mappers/tweet.mapper';

@Injectable()
export class MongoTweetRepository implements TweetRepository {
  constructor(
    @InjectModel(TweetModel.name)
    private readonly tweetModel: Model<TweetModel>,
  ) {}

  async save(tweet: Tweet): Promise<Tweet> {
    const tweetDoc = TweetMapper.toPersistence(tweet);
    const savedDoc = await this.tweetModel.create(tweetDoc);
    const populatedDoc = await savedDoc.populate('authorId', 'username profileImage');
    return TweetMapper.toDomain(populatedDoc);
  }

  async findById(id: TweetId): Promise<Tweet | null> {
    const doc = await this.tweetModel
      .findById(id.getValue())
      .populate('authorId', 'username profileImage')
      .populate({
        path: 'originalTweetId',
        populate: {
          path: 'authorId',
          select: 'username profileImage'
        }
      })
      .exec();
    
    return doc ? TweetMapper.toDomain(doc) : null;
  }

  async findByIds(ids: TweetId[]): Promise<Tweet[]> {
    const idStrings = ids.map(id => id.getValue());
    const docs = await this.tweetModel
  .find({ _id: { $in: idStrings } })
  .populate('authorId', 'username profileImage')
      .exec();
    
    return docs.map(doc => TweetMapper.toDomain(doc));
  }

  async update(tweet: Tweet): Promise<Tweet> {
    const tweetDoc = TweetMapper.toPersistence(tweet);
    const updatedDoc = await this.tweetModel
  .findByIdAndUpdate(tweet.getId().getValue(), tweetDoc, { new: true })
  .populate('authorId', 'username profileImage')
      .exec();
    
    if (!updatedDoc) {
      throw new Error(`Tweet with id ${tweet.getId().getValue()} not found`);
    }
    
    return TweetMapper.toDomain(updatedDoc);
  }

  async delete(id: TweetId): Promise<void> {
    await this.tweetModel.findByIdAndDelete(id.getValue()).exec();
  }

  async findByAuthor(authorId: AuthorId): Promise<Tweet[]> {
    const docs = await this.tweetModel
      .find({ authorId: new Types.ObjectId(authorId.getValue()) })
      .populate('authorId', 'username profileImage')
      .sort({ createdAt: -1 })
      .exec();

    return docs.map(doc => TweetMapper.toDomain(doc));
  }

  async findRepliesTo(tweetId: TweetId): Promise<Tweet[]> {

    const docs = await this.tweetModel
    .find({ parentTweetId: new Types.ObjectId(tweetId.getValue()) })
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

  private buildAuthorFilters(authorId: AuthorId): Record<string, unknown>[] {
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