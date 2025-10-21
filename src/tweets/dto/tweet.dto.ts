import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsArray, MaxLength } from 'class-validator';

export class CreateTweetDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(280)
  content: string;

  // userId se asigna automáticamente desde el token JWT
  // @IsNotEmpty()
  // @IsString()
  // userId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentions?: string[];

  @IsOptional()
  @IsBoolean()
  isRetweet?: boolean;

  @IsOptional()
  @IsString()
  originalTweetId?: string;
}

export class UpdateTweetDto {
  @IsOptional()
  @IsString()
  @MaxLength(280)
  content?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentions?: string[];
}