import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TweetDocument = Tweet & Document;

@Schema({ timestamps: true })
export class Tweet {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

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

  @Prop({ default: false })
  isRetweet: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Tweet' })
  originalTweetId?: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const TweetSchema = SchemaFactory.createForClass(Tweet);