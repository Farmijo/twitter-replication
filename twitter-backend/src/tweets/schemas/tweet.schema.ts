import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TweetDocument = Tweet & Document;

@Schema({ 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      
      // Transformar también los campos populate si existen
      if (ret.originalTweetId && ret.originalTweetId._id) {
        ret.originalTweetId.id = ret.originalTweetId._id;
        delete ret.originalTweetId._id;
        delete ret.originalTweetId.__v;
      }
      
      if (ret.userId && ret.userId._id) {
        ret.userId.id = ret.userId._id;
        delete ret.userId._id;
        delete ret.userId.__v;
      }
      
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      
      // Transformar también los campos populate si existen
      if (ret.originalTweetId && ret.originalTweetId._id) {
        ret.originalTweetId.id = ret.originalTweetId._id;
        delete ret.originalTweetId._id;
        delete ret.originalTweetId.__v;
      }
      
      if (ret.userId && ret.userId._id) {
        ret.userId.id = ret.userId._id;
        delete ret.userId._id;
        delete ret.userId.__v;
      }
      
      return ret;
    }
  }
})
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