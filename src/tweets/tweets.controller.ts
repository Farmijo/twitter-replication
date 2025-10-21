import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TweetsService } from './tweets.service';
import { CreateTweetDto, UpdateTweetDto } from './dto/tweet.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('tweets')
@UsePipes(new ValidationPipe())
export class TweetsController {
  constructor(private readonly tweetsService: TweetsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTweetDto: CreateTweetDto, @Request() req) {
    const tweetData = {
      ...createTweetDto,
      userId: req.user._id.toString(),
    };
    
    const tweet = await this.tweetsService.create(tweetData);
    return {
      message: 'Tweet created successfully',
      data: tweet,
    };
  }

  @Get()
  async findAll(
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const skipNum = skip ? parseInt(skip, 10) : 0;
    
    const tweets = await this.tweetsService.findAll(limitNum, skipNum);
    return {
      message: 'Tweets retrieved successfully',
      data: tweets,
      count: tweets.length,
      pagination: {
        limit: limitNum,
        skip: skipNum,
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const tweet = await this.tweetsService.findOne(id);
    return {
      message: 'Tweet retrieved successfully',
      data: tweet,
    };
  }

  @Get('user/:userId')
  async findByUser(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const skipNum = skip ? parseInt(skip, 10) : 0;
    
    const tweets = await this.tweetsService.findByUser(userId, limitNum, skipNum);
    return {
      message: 'User tweets retrieved successfully',
      data: tweets,
      count: tweets.length,
      pagination: {
        limit: limitNum,
        skip: skipNum,
      },
    };
  }

  @Get('hashtag/:hashtag')
  async findByHashtag(
    @Param('hashtag') hashtag: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const skipNum = skip ? parseInt(skip, 10) : 0;
    
    const tweets = await this.tweetsService.findByHashtag(hashtag, limitNum, skipNum);
    return {
      message: `Tweets with hashtag #${hashtag} retrieved successfully`,
      data: tweets,
      count: tweets.length,
      pagination: {
        limit: limitNum,
        skip: skipNum,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTweetDto: UpdateTweetDto,
    @Request() req,
  ) {
    const tweet = await this.tweetsService.findOne(id);
    if (req.user.role !== 'admin' && tweet.userId.toString() !== req.user._id.toString()) {
      throw new Error('Forbidden: You can only update your own tweets');
    }

    const updatedTweet = await this.tweetsService.update(id, updateTweetDto);
    return {
      message: 'Tweet updated successfully',
      data: updatedTweet,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    const tweet = await this.tweetsService.findOne(id);
    if (req.user.role !== 'admin' && tweet.userId.toString() !== req.user._id.toString()) {
      throw new Error('Forbidden: You can only delete your own tweets');
    }

    await this.tweetsService.remove(id);
    return {
      message: 'Tweet deleted successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async likeTweet(@Param('id') id: string) {
    const tweet = await this.tweetsService.likeTweet(id);
    return {
      message: 'Tweet liked successfully',
      data: tweet,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/retweet')
  async retweetTweet(@Param('id') id: string, @Request() req) {
    const retweet = await this.tweetsService.retweetTweet(id, req.user._id.toString());
    return {
      message: 'Tweet retweeted successfully',
      data: retweet,
    };
  }
}