import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TweetDocument = Tweet & Document;

export enum TweetTypeSchema {
  ORIGINAL = 'original',
  RETWEET = 'retweet',
  REPLY = 'reply',
}

@Schema({ 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class Tweet {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: TweetTypeSchema, default: TweetTypeSchema.ORIGINAL })
  type: string;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  retweetsCount: number;

  @Prop({ default: 0 })
  repliesCount: number;

  @Prop({ type: [String], default: [] })
  hashtags: string[];

  @Prop({ type: [String], default: [] })
  mentions: string[];

  @Prop({ type: Types.ObjectId, ref: 'Tweet' })
  originalTweetId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tweet' })
  parentTweetId?: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const TweetSchema = SchemaFactory.createForClass(Tweet);