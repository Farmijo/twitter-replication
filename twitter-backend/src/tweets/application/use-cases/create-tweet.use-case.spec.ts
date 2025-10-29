import { Tweet, TweetType } from '../../domain/entities/tweet.entity';
import { TweetRepository } from '../../domain/repositories/tweet.repository';
import { AuthorId } from '../../domain/value-objects/author-id.vo';
import { TweetContent } from '../../domain/value-objects/tweet-content.vo';
import { TweetId } from '../../domain/value-objects/tweet-id.vo';
import { CreateTweetUseCase, CreateTweetCommand } from './create-tweet.use-case';

const createTweetRepositoryMock = (): jest.Mocked<TweetRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByIds: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByAuthor: jest.fn(),
  findRepliesTo: jest.fn(),
  findRecent: jest.fn(),
});

describe('CreateTweetUseCase', () => {
  let tweetRepository: jest.Mocked<TweetRepository>;
  let useCase: CreateTweetUseCase;

  beforeEach(() => {
    tweetRepository = createTweetRepositoryMock();
    useCase = new CreateTweetUseCase(tweetRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls Tweet.createRetweet when command includes originalTweetId', async () => {
    const command: CreateTweetCommand = {
      content: 'Retweeting something',
      authorId: 'author-123',
      type: TweetType.RETWEET,
      originalTweetId: 'original-456',
    };

    const retweet = {} as unknown as Tweet;
    const createRetweetSpy = jest.spyOn(Tweet, 'createRetweet').mockReturnValue(retweet);
    const createReplySpy = jest.spyOn(Tweet, 'createReply');
    tweetRepository.save.mockResolvedValue(retweet);

    await useCase.execute(command);

    expect(createRetweetSpy).toHaveBeenCalledTimes(1);
    const [tweetId, content, authorId, originalTweetId] = createRetweetSpy.mock.calls[0];
    expect(tweetId).toBeInstanceOf(TweetId);
    expect(content).toBeInstanceOf(TweetContent);
    expect(authorId).toBeInstanceOf(AuthorId);
    expect(originalTweetId).toBeInstanceOf(TweetId);
    expect((originalTweetId as TweetId).getValue()).toBe(command.originalTweetId);

    expect(createReplySpy).not.toHaveBeenCalled();
    expect(tweetRepository.save).toHaveBeenCalledWith(retweet);
  });

  it('calls Tweet.createReply when command includes parentTweetId', async () => {
    const command: CreateTweetCommand = {
      content: 'Replying to a tweet',
      authorId: 'author-789',
      type: TweetType.REPLY,
      parentTweetId: 'parent-456',
    };

    const reply = {} as unknown as Tweet;
    const createReplySpy = jest.spyOn(Tweet, 'createReply').mockReturnValue(reply);
    const createRetweetSpy = jest.spyOn(Tweet, 'createRetweet');
    tweetRepository.save.mockResolvedValue(reply);

    await useCase.execute(command);

    expect(createReplySpy).toHaveBeenCalledTimes(1);
    const [tweetId, content, authorId, parentTweetId] = createReplySpy.mock.calls[0];
    expect(tweetId).toBeInstanceOf(TweetId);
    expect(content).toBeInstanceOf(TweetContent);
    expect(authorId).toBeInstanceOf(AuthorId);
    expect(parentTweetId).toBeInstanceOf(TweetId);
    expect((parentTweetId as TweetId).getValue()).toBe(command.parentTweetId);

    expect(createRetweetSpy).not.toHaveBeenCalled();
    expect(tweetRepository.save).toHaveBeenCalledWith(reply);
  });
});
