import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { TweetType } from '../domain/entities/tweet.entity';

export class CreateTweetDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsEnum(TweetType)
  type?: TweetType;

  @IsOptional()
  @IsString()
  originalTweetId?: string;

  @IsOptional()
  @IsString()
  parentTweetId?: string;
}