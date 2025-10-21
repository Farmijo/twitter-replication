import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tweet, TweetDocument } from './schemas/tweet.schema';
import { CreateTweetDto, UpdateTweetDto } from './dto/tweet.dto';

@Injectable()
export class TweetsService {
  constructor(
    @InjectModel(Tweet.name) private tweetModel: Model<TweetDocument>,
  ) {}

  async create(createTweetDto: CreateTweetDto): Promise<Tweet> {
    const content = createTweetDto.content;
    const hashtags = this.extractHashtags(content);
    const mentions = this.extractMentions(content);

    const tweetData = {
      ...createTweetDto,
      hashtags: hashtags.length > 0 ? hashtags : createTweetDto.hashtags || [],
      mentions: mentions.length > 0 ? mentions : createTweetDto.mentions || [],
    };

    const createdTweet = new this.tweetModel(tweetData);
    return await createdTweet.save();
  }

  async findAll(limit: number = 50, skip: number = 0): Promise<Tweet[]> {
    return this.tweetModel
      .find()
      .populate('userId', 'username profileImage')
      .populate('originalTweetId')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  async findOne(id: string): Promise<Tweet> {
    const tweet = await this.tweetModel
      .findById(id)
      .populate('userId', 'username profileImage')
      .populate('originalTweetId')
      .exec();
    
    if (!tweet) {
      throw new NotFoundException('Tweet not found');
    }
    return tweet;
  }

  async findByUser(userId: string, limit: number = 50, skip: number = 0): Promise<Tweet[]> {
    return this.tweetModel
      .find({ userId })
      .populate('userId', 'username profileImage')
      .populate('originalTweetId')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  async findByHashtag(hashtag: string, limit: number = 50, skip: number = 0): Promise<Tweet[]> {
    return this.tweetModel
      .find({ hashtags: { $in: [hashtag] } })
      .populate('userId', 'username profileImage')
      .populate('originalTweetId')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  async update(id: string, updateTweetDto: UpdateTweetDto): Promise<Tweet> {
    let updateData = { ...updateTweetDto, updatedAt: new Date() };

    if (updateTweetDto.content) {
      const hashtags = this.extractHashtags(updateTweetDto.content);
      const mentions = this.extractMentions(updateTweetDto.content);
      
      updateData = {
        ...updateData,
        hashtags: hashtags.length > 0 ? hashtags : updateTweetDto.hashtags || [],
        mentions: mentions.length > 0 ? mentions : updateTweetDto.mentions || [],
      };
    }

    const updatedTweet = await this.tweetModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('userId', 'username profileImage')
      .populate('originalTweetId')
      .exec();
    
    if (!updatedTweet) {
      throw new NotFoundException('Tweet not found');
    }
    return updatedTweet;
  }

  async remove(id: string): Promise<void> {
    const result = await this.tweetModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Tweet not found');
    }
  }

  async likeTweet(id: string): Promise<Tweet> {
    const tweet = await this.tweetModel
      .findByIdAndUpdate(
        id,
        { $inc: { likesCount: 1 }, updatedAt: new Date() },
        { new: true }
      )
      .populate('userId', 'username profileImage')
      .exec();
    
    if (!tweet) {
      throw new NotFoundException('Tweet not found');
    }
    return tweet;
  }

  async retweetTweet(id: string, userId: string): Promise<Tweet> {
    await this.tweetModel
      .findByIdAndUpdate(
        id,
        { $inc: { retweetsCount: 1 }, updatedAt: new Date() }
      )
      .exec();

    const retweetData = {
      content: '',
      userId,
      isRetweet: true,
      originalTweetId: id,
      likesCount: 0,
      retweetsCount: 0,
      repliesCount: 0,
    };

    const retweet = new this.tweetModel(retweetData);
    return await retweet.save();
  }

  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const matches = content.match(mentionRegex);
    return matches ? matches.map(mention => mention.substring(1)) : [];
  }
}