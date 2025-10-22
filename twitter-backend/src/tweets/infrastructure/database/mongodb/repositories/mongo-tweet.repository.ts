import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

  async save(tweet: Tweet): Promise<Tweet> {
    const tweetDoc = TweetMapper.toPersistence(tweet);
    const savedDoc = await this.tweetModel.create(tweetDoc);
    return TweetMapper.toDomain(savedDoc);
  }

  async findById(id: TweetId): Promise<Tweet | null> {
    const doc = await this.tweetModel
      .findById(id.getValue())
      .populate('author', 'username displayName')
      .exec();
    
    return doc ? TweetMapper.toDomain(doc) : null;
  }

  async findByIds(ids: TweetId[]): Promise<Tweet[]> {
    const idStrings = ids.map(id => id.getValue());
    const docs = await this.tweetModel
      .find({ _id: { $in: idStrings } })
      .populate('author', 'username displayName')
      .exec();
    
    return docs.map(doc => TweetMapper.toDomain(doc));
  }

  async update(tweet: Tweet): Promise<Tweet> {
    const tweetDoc = TweetMapper.toPersistence(tweet);
    const updatedDoc = await this.tweetModel
      .findByIdAndUpdate(tweet.getId().getValue(), tweetDoc, { new: true })
      .populate('author', 'username displayName')
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
    const docs = await this.tweetModel
      .find({ author: authorId.getValue() })
      .populate('author', 'username displayName')
      .sort({ createdAt: -1 })
      .exec();
    
    return docs.map(doc => TweetMapper.toDomain(doc));
  }

  async findRepliesTo(tweetId: TweetId): Promise<Tweet[]> {
    const docs = await this.tweetModel
      .find({ replyTo: tweetId.getValue() })
      .populate('author', 'username displayName')
      .sort({ createdAt: 1 })
      .exec();
    
    return docs.map(doc => TweetMapper.toDomain(doc));
  }
}