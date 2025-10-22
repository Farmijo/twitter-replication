import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TweetDocument = TweetModel & Document;

export enum TweetTypeModel {
  ORIGINAL = 'original',
  RETWEET = 'retweet',
  REPLY = 'reply'
}

@Schema({ 
  collection: 'tweets',
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class TweetModel {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  authorId: Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: Object.values(TweetTypeModel), 
    default: TweetTypeModel.ORIGINAL,
    index: true
  })
  type: TweetTypeModel;

  @Prop({ type: Types.ObjectId, default: null, index: true })
  originalTweetId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, default: null, index: true })
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