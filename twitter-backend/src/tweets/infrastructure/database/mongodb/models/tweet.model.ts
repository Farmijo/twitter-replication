import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserModel } from '../../../../../users/infrastructure/database/mongodb/models/user.model';

export enum TweetTypeModel {
  ORIGINAL = 'original',
  RETWEET = 'retweet',
  REPLY = 'reply'
}

@Schema({ 
  collection: 'tweets',
  timestamps: true,
})
export class TweetModel {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: UserModel.name, required: true, index: true })
  authorId: Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: Object.values(TweetTypeModel), 
    default: TweetTypeModel.ORIGINAL,
    index: true
  })
  type: TweetTypeModel;

  @Prop({ type: Types.ObjectId, ref: TweetModel.name, default: null, index: true })
  originalTweetId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: TweetModel.name, default: null, index: true })
  parentTweetId: Types.ObjectId | null;

  @Prop({ default: 0, min: 0 })
  likesCount: number;

  @Prop({ default: 0, min: 0 })
  retweetsCount: number;

  @Prop({ default: 0, min: 0 })
  repliesCount: number;

  @Prop({ type: [String], default: [], index: true })
  hashtags: string[];

  @Prop({ type: [String], default: [], index: true })
  mentions: string[];

  @Prop({ default: false })
  isDeleted: boolean;

  // Timestamps (handled by Mongoose)
  createdAt: Date;
  updatedAt: Date;
}

export type TweetModelAttributes = Omit<TweetModel, 'createdAt' | 'updatedAt'> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt?: Date;
};

export const TweetSchema = SchemaFactory.createForClass(TweetModel);

// Indexes for better performance
TweetSchema.index({ authorId: 1, createdAt: -1 });
TweetSchema.index({ createdAt: -1 });
TweetSchema.index({ hashtags: 1, createdAt: -1 });
TweetSchema.index({ mentions: 1, createdAt: -1 });
TweetSchema.index({ type: 1, createdAt: -1 });
TweetSchema.index({ originalTweetId: 1 });
TweetSchema.index({ parentTweetId: 1 });

// Compound indexes for complex queries
TweetSchema.index({ authorId: 1, type: 1, createdAt: -1 });
TweetSchema.index({ isDeleted: 1, createdAt: -1 });

// Text index for content search
TweetSchema.index({ content: 'text' });