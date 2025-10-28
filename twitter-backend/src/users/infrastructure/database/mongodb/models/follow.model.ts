import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserModel } from './user.model';

export type FollowDocument = FollowModel & Document;

@Schema({ collection: 'follows', timestamps: true })
export class FollowModel {
  @Prop({ type: Types.ObjectId, ref: UserModel.name, required: true, index: true })
  followerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: UserModel.name, required: true, index: true })
  followeeId: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const FollowSchema = SchemaFactory.createForClass(FollowModel);

FollowSchema.index({ followerId: 1, followeeId: 1 }, { unique: true });
