import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateTweetDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}