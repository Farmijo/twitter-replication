import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

// Use Cases - Commands (Write)
import { CreateTweetUseCase, CreateTweetCommand } from '../application/use-cases/create-tweet.use-case';
import { UpdateTweetUseCase, UpdateTweetCommand } from '../application/use-cases/update-tweet.use-case';
import { DeleteTweetUseCase, DeleteTweetCommand } from '../application/use-cases/delete-tweet.use-case';

// Use Cases - Queries (Read)
import { GetTweetByIdUseCase } from '../application/use-cases/get-tweet-by-id.use-case';
import { GetTweetsByAuthorUseCase } from '../application/use-cases/get-tweets-by-author.use-case';
import { GetRepliesUseCase } from '../application/use-cases/get-replies.use-case';
import { GetRecentTweetsUseCase } from '../application/use-cases/get-recent-tweets.use-case';

// DTOs
import { CreateTweetDto } from '../dto/create-tweet.dto';
import { UpdateTweetDto } from '../dto/update-tweet.dto';

@Controller('tweets')
export class TweetsController {
  constructor(
    // Command Use Cases
    private readonly createTweetUseCase: CreateTweetUseCase,
    private readonly updateTweetUseCase: UpdateTweetUseCase,
    private readonly deleteTweetUseCase: DeleteTweetUseCase,
    
    // Query Use Cases  
    private readonly getTweetByIdUseCase: GetTweetByIdUseCase,
    private readonly getTweetsByAuthorUseCase: GetTweetsByAuthorUseCase,
    private readonly getRepliesUseCase: GetRepliesUseCase,
    private readonly getRecentTweetsUseCase: GetRecentTweetsUseCase,
  ) {}

  // Check Auth Guard in order to know what injects the user info
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTweet(@Body() createTweetDto: CreateTweetDto, @Request() req) {
    const command: CreateTweetCommand = {
      content: createTweetDto.content,
      authorId: req.user._id.toString(),
      type: createTweetDto.type,
      originalTweetId: createTweetDto.originalTweetId,
      parentTweetId: createTweetDto.parentTweetId,
    };

    const tweet = await this.createTweetUseCase.execute(command);

    //TODO: Switch to response without data object
    return {
      message: 'Tweet created successfully',
      data: this.formatTweetResponse(tweet),
    };
  }

  @Get()
  async getRecentTweets(@Query('limit') limit?: string, @Query('skip') skip?: string) {
    const limitNumber = limit ? Number(limit) : NaN;
    const skipNumber = skip ? Number(skip) : NaN;

    const parsedLimit = Number.isFinite(limitNumber) && limitNumber > 0
      ? Math.min(Math.floor(limitNumber), 100)
      : 20;

    const parsedSkip = Number.isFinite(skipNumber) && skipNumber >= 0
      ? Math.floor(skipNumber)
      : 0;

    const tweets = await this.getRecentTweetsUseCase.execute(parsedLimit, parsedSkip);

    return {
      message: 'Recent tweets retrieved successfully',
      data: tweets,
      count: tweets.length,
      pagination: {
        limit: parsedLimit,
        skip: parsedSkip,
      },
    };
  }

    /**
   * Obtener tweet por ID
   * GET /tweets/:id
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getTweetById(@Param('id') id: string) {
    const tweet = await this.getTweetByIdUseCase.execute(id);
    
    return {
      message: 'Tweet retrieved successfully',
      data: tweet,
    };
  }

  /**
   * Obtener tweets de un autor
   * GET /tweets/author/:authorId
   */
  @Get('author/:authorId')
  async getTweetsByAuthor(@Param('authorId') authorId: string) {
    const tweets = await this.getTweetsByAuthorUseCase.execute(authorId);
    
    return {
      message: 'Author tweets retrieved successfully',
      data: tweets,
      count: tweets.length,
    };
  }

  /**
   * Obtener respuestas a un tweet
   * GET /tweets/:id/replies
   */ 
  @Get(':id/replies')
  async getReplies(@Param('id') id: string) {
    const replies = await this.getRepliesUseCase.execute(id);
    
    return {
      message: 'Tweet replies retrieved successfully',
      data: replies,
      count: replies.length,
    };
  }

  /**
   * Actualizar un tweet
   * PUT /tweets/:id
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateTweet(
    @Param('id') id: string,
    @Body() updateTweetDto: UpdateTweetDto,
    @Request() req,
  ) {
    const command: UpdateTweetCommand = {
      tweetId: id,
      userId: req.user._id.toString(),
      newContent: updateTweetDto.content,
    };

    const tweet = await this.updateTweetUseCase.execute(command);
    
    return {
      message: 'Tweet updated successfully',
      data: this.formatTweetResponse(tweet),
    };
  }

  /**
   * Eliminar un tweet
   * DELETE /tweets/:id
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTweet(@Param('id') id: string, @Request() req) {
    const command: DeleteTweetCommand = {
      tweetId: id,
      userId: req.user._id.toString(),
    };

    await this.deleteTweetUseCase.execute(command);
    
    return {
      message: 'Tweet deleted successfully',
    };
  }

  /**
   * Helper para formatear respuesta del tweet
   * 
   * // A discutir si este helper debería estar en otro sitio --- IGNORE ---
   * // por ejemplo, en la capa de aplicación
   */
  private formatTweetResponse(tweet: any) {
    return {
      id: tweet.getId().getValue(),
      content: tweet.getContent(),
      authorId: tweet.getAuthorId().getValue(),
      author: tweet.getAuthorSnapshot(),
      type: tweet.getType(),
      likesCount: tweet.getLikesCount(),
      retweetsCount: tweet.getRetweetsCount(),
      repliesCount: tweet.getRepliesCount(),
      hashtags: tweet.getHashtags(),
      mentions: tweet.getMentions(),
      createdAt: tweet.getCreatedAt(),
      originalTweetId: tweet.getOriginalTweetId()?.getValue() || null,
      parentTweetId: tweet.getParentTweetId()?.getValue() || null,
    };
  }
}