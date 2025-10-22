# 🤖 Project Architectural Rules

## 📋 Project Context
This is a learning project that replicates Twitter functionality using:
- **Architecture**: Hexagonal (Ports & Adapters)
- **Backend**: NestJS + MongoDB + Mongoose
- **Goal**: Experiment with different DB implementations and endpoints

## 🏗️ Hexagonal Architecture (Ports & Adapters) + DDD Bounded Contexts

### Fundamental Principles
1. **Layer separation**: Domain, Application, Infrastructure
2. **Dependency inversion**: Domain should not depend on infrastructure
3. **Ports and Adapters**: Interfaces for external communication
4. **Testability**: Each layer should be testable independently
5. **Interchangeability**: Ability to change implementations without affecting the domain
6. **Bounded Contexts**: Each module (Users, Tweets) is independent with its own domain model

### 📁 Target Folder Structure (DDD Bounded Contexts)
```
src/
├── users/                      # 👤 Users Bounded Context
│   ├── domain/                 # 🎯 Users business core
│   │   ├── entities/           # User domain entities
│   │   │   └── user.entity.ts
│   │   ├── value-objects/      # User value objects
│   │   │   ├── user-id.vo.ts
│   │   │   ├── username.vo.ts
│   │   │   ├── email.vo.ts
│   │   │   └── password.vo.ts
│   │   ├── repositories/       # User repository interfaces (ports)
│   │   │   └── user.repository.ts
│   │   └── services/           # User domain services
│   │       └── user-domain.service.ts
│   ├── application/            # 🔄 Users use cases
│   │   ├── use-cases/          # User-specific use cases
│   │   │   ├── create-user/
│   │   │   │   ├── create-user.use-case.ts
│   │   │   │   ├── create-user.command.ts
│   │   │   │   └── create-user.dto.ts
│   │   │   ├── follow-user/
│   │   │   └── get-user-profile/
│   │   └── dto/                # User DTOs
│   │       ├── user-response.dto.ts
│   │       └── user-stats.dto.ts
│   ├── infrastructure/         # 🔧 Users external adapters
│   │   ├── database/           # User DB implementations
│   │   │   ├── mongodb/
│   │   │   │   ├── models/     # User Mongoose schemas
│   │   │   │   │   └── user.model.ts
│   │   │   │   ├── repositories/  # User repository implementations
│   │   │   │   │   └── mongo-user.repository.ts
│   │   │   │   └── mappers/    # User domain ↔ DB conversion
│   │   │   │       └── user.mapper.ts
│   │   │   └── postgresql/     # (Future implementation)
│   │   └── http/               # User REST controllers
│   │       └── controllers/
│   │           └── users.controller.ts
│   └── users.module.ts         # Users NestJS module
├── tweets/                     # 🐦 Tweets Bounded Context
│   ├── domain/                 # 🎯 Tweets business core
│   │   ├── entities/           # Tweet domain entities
│   │   │   └── tweet.entity.ts
│   │   ├── value-objects/      # Tweet value objects
│   │   │   ├── tweet-id.vo.ts
│   │   │   ├── tweet-content.vo.ts
│   │   │   └── hashtag.vo.ts
│   │   ├── repositories/       # Tweet repository interfaces (ports)
│   │   │   └── tweet.repository.ts
│   │   └── services/           # Tweet domain services
│   │       └── tweet-domain.service.ts
│   ├── application/            # 🔄 Tweets use cases
│   │   ├── use-cases/          # Tweet-specific use cases
│   │   │   ├── create-tweet/
│   │   │   │   ├── create-tweet.use-case.ts
│   │   │   │   ├── create-tweet.command.ts
│   │   │   │   └── create-tweet.dto.ts
│   │   │   ├── like-tweet/
│   │   │   └── get-timeline/
│   │   └── dto/                # Tweet DTOs
│   │       ├── tweet-response.dto.ts
│   │       └── timeline.dto.ts
│   ├── infrastructure/         # 🔧 Tweets external adapters
│   │   ├── database/           # Tweet DB implementations
│   │   │   ├── mongodb/
│   │   │   │   ├── models/     # Tweet Mongoose schemas
│   │   │   │   │   └── tweet.model.ts
│   │   │   │   ├── repositories/  # Tweet repository implementations
│   │   │   │   │   └── mongo-tweet.repository.ts
│   │   │   │   └── mappers/    # Tweet domain ↔ DB conversion
│   │   │   │       └── tweet.mapper.ts
│   │   │   └── postgresql/     # (Future implementation)
│   │   └── http/               # Tweet REST controllers
│   │       └── controllers/
│   │           └── tweets.controller.ts
│   └── tweets.module.ts        # Tweets NestJS module
├── auth/                       # 🔐 Authentication Context (Cross-cutting)
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── jwt-auth.guard.ts
│   └── jwt.strategy.ts
├── shared/                     # 🔄 Shared code across contexts
│   ├── domain/                 # Shared domain concepts
│   │   ├── value-objects/      # Common value objects
│   │   │   └── id.vo.ts
│   │   └── exceptions/         # Domain exceptions
│   │       ├── domain.exception.ts
│   │       ├── not-found.exception.ts
│   │       └── validation.exception.ts
│   ├── infrastructure/         # Shared infrastructure concerns
│   │   ├── database/           # DB configuration
│   │   │   └── mongoose.config.ts
│   │   └── config/             # App configuration
│   │       └── app.config.ts
│   └── types/                  # Shared TypeScript types
│       └── common.types.ts
├── app.module.ts               # Main application module
└── main.ts                     # Application entry point
```

## 📐 Layer-Specific Rules (Per Bounded Context)

### 🏛️ Bounded Context Rules
- **Independence**: Each context (users/, tweets/) is self-contained
- **Domain Model**: Each context has its own domain entities and value objects
- **Anti-Corruption Layer**: Use mappers when contexts communicate
- **Shared Kernel**: Only shared/ contains cross-context code
- **Context Integration**: Inter-context communication through application services

### 🎯 Domain Layer (domain/ within each context)

#### Entities
```typescript
// ✅ CORRECT: User domain entity (users/domain/entities/user.entity.ts)
export class User {
  constructor(
    private readonly id: UserId,
    private username: Username,
    private email: Email,
    private password: Password,
    private role: UserRole = UserRole.USER,
    private followersCount: number = 0,
    private followingCount: number = 0,
    private readonly createdAt: Date = new Date()
  ) {}

  // Getters
  public getId(): UserId { return this.id; }
  public getUsername(): string { return this.username.getValue(); }
  public getEmail(): string { return this.email.getValue(); }
  
  // Business logic
  public updateProfile(username: string, bio?: string): void {
    this.username = new Username(username);
    // Additional profile update logic
  }
  
  public follow(): void {
    this.followingCount++;
  }
  
  public unfollow(): void {
    if (this.followingCount > 0) {
      this.followingCount--;
    }
  }
  
  public addFollower(): void {
    this.followersCount++;
  }
  
  public removeFollower(): void {
    if (this.followersCount > 0) {
      this.followersCount--;
    }
  }
  
  public canBeFollowedBy(userId: UserId): boolean {
    return !this.id.equals(userId);
  }
  
  public isActive(): boolean {
    return true; // Business logic for active users
  }
}

// ✅ CORRECT: Tweet domain entity (tweets/domain/entities/tweet.entity.ts)
export class Tweet {
  constructor(
    private readonly id: TweetId,
    private content: TweetContent,
    private readonly authorId: UserId, // Reference to User context
    private likesCount: number = 0,
    private readonly createdAt: Date = new Date()
  ) {}

  // Getters
  public getId(): TweetId { return this.id; }
  public getContent(): string { return this.content.getValue(); }
  public getAuthorId(): UserId { return this.authorId; }
  
  // Business logic
  public updateContent(newContent: string): void {
    this.content = new TweetContent(newContent);
  }
  
  public like(): void {
    this.likesCount++;
  }
  
  public canBeEditedBy(userId: UserId): boolean {
    return this.isOwnedBy(userId) && this.isRecentEnough();
  }
  
  private isOwnedBy(userId: UserId): boolean {
    return this.authorId.equals(userId);
  }
  
  private isRecentEnough(): boolean {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.createdAt > fiveMinutesAgo;
  }
}
```

**Entity Rules:**
- ✅ Pure TypeScript classes (no decorators)
- ✅ Encapsulate business logic in methods
- ✅ Use Value Objects for validations
- ✅ Constructor with required parameters
- ❌ DO NOT use Mongoose/TypeORM decorators
- ❌ DO NOT import infrastructure libraries
- ❌ DO NOT include persistence logic

#### Value Objects
```typescript
// ✅ CORRECT: Value Object with validation
export class TweetContent {
  private static readonly MAX_LENGTH = 280;
  
  constructor(private readonly value: string) {
    this.validate();
  }
  
  public getValue(): string {
    return this.value;
  }
  
  public equals(other: TweetContent): boolean {
    return this.value === other.value;
  }
  
  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new InvalidTweetContentError('Tweet content cannot be empty');
    }
    
    if (this.value.length > TweetContent.MAX_LENGTH) {
      throw new InvalidTweetContentError(`Tweet content exceeds ${TweetContent.MAX_LENGTH} characters`);
    }
  }
}
```

#### Repositories (Interfaces)
```typescript
// ✅ CORRECT: Port (interface) in domain
export interface TweetRepository {
  save(tweet: Tweet): Promise<void>;
  findById(id: TweetId): Promise<Tweet | null>;
  findByAuthor(authorId: UserId): Promise<Tweet[]>;
  findAll(limit: number, offset: number): Promise<Tweet[]>;
  delete(id: TweetId): Promise<void>;
  count(): Promise<number>;
}
```

### 🔄 Application Layer (application/)

#### Use Cases
```typescript
// ✅ CORRECT: Use case with orchestration
@Injectable()
export class CreateTweetUseCase {
  constructor(
    @Inject(TOKENS.TweetRepository) private tweetRepo: TweetRepository,
    @Inject(TOKENS.UserRepository) private userRepo: UserRepository
  ) {}

  async execute(command: CreateTweetCommand): Promise<TweetDto> {
    // 1. Validate user exists
    const user = await this.userRepo.findById(new UserId(command.authorId));
    if (!user) {
      throw new UserNotFoundError(command.authorId);
    }

    // 2. Create domain entity
    const tweet = new Tweet(
      TweetId.generate(),
      new TweetContent(command.content),
      new UserId(command.authorId)
    );

    // 3. Save using repository
    await this.tweetRepo.save(tweet);

    // 4. Return DTO
    return TweetMapper.toDto(tweet);
  }
}
```

**Use Case Rules:**
- ✅ One use case per business operation
- ✅ Orchestrate between repositories and services
- ✅ Use dependency injection with tokens
- ✅ Business validations
- ❌ DO NOT know HTTP or DB details
- ❌ DO NOT handle HTTP exceptions
- ❌ DO NOT access DB models directly

### 🔧 Infrastructure Layer (infrastructure/)

#### Database Models
```typescript
// ✅ CORRECT: Separate MongoDB model
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

  @Prop({ type: Types.ObjectId, ref: 'UserModel', required: true })
  authorId: Types.ObjectId;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  retweetsCount: number;

  @Prop({ type: [String], default: [] })
  hashtags: string[];

  @Prop({ default: false })
  isRetweet: boolean;

  @Prop({ type: Types.ObjectId, ref: 'TweetModel' })
  originalTweetId?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const TweetSchema = SchemaFactory.createForClass(TweetModel);
```

#### Repository Implementation
```typescript
// ✅ CORRECT: Adapter that implements the port
@Injectable()
export class MongoTweetRepository implements TweetRepository {
  constructor(
    @InjectModel(TweetModel.name) private tweetModel: Model<TweetDocument>
  ) {}

  async save(tweet: Tweet): Promise<void> {
    const mongoTweet = TweetMapper.toMongo(tweet);
    await this.tweetModel.create(mongoTweet);
  }

  async findById(id: TweetId): Promise<Tweet | null> {
    const doc = await this.tweetModel.findById(id.getValue()).exec();
    return doc ? TweetMapper.toDomain(doc) : null;
  }

  async findByAuthor(authorId: UserId): Promise<Tweet[]> {
    const docs = await this.tweetModel
      .find({ authorId: authorId.getValue() })
      .sort({ createdAt: -1 })
      .exec();
    
    return docs.map(doc => TweetMapper.toDomain(doc));
  }
}
```

#### Mappers
```typescript
// ✅ CORRECT: Layer conversion
export class TweetMapper {
  static toDomain(model: TweetDocument): Tweet {
    return new Tweet(
      new TweetId(model._id.toString()),
      new TweetContent(model.content),
      new UserId(model.authorId.toString()),
      model.likesCount || 0,
      model.createdAt
    );
  }

  static toMongo(entity: Tweet): Partial<TweetModel> {
    return {
      content: entity.getContent(),
      authorId: new Types.ObjectId(entity.getAuthorId().getValue()),
      likesCount: entity.getLikesCount(),
      createdAt: entity.getCreatedAt()
    };
  }

  static toDto(entity: Tweet): TweetDto {
    return {
      id: entity.getId().getValue(),
      content: entity.getContent(),
      authorId: entity.getAuthorId().getValue(),
      likesCount: entity.getLikesCount(),
      createdAt: entity.getCreatedAt().toISOString()
    };
  }
}
```

#### Controllers
```typescript
// ✅ CORRECT: Only HTTP handling, delegates to use cases
@Controller('tweets')
export class TweetsController {
  constructor(
    private createTweetUseCase: CreateTweetUseCase,
    private getTweetsUseCase: GetTweetsUseCase
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createTweet(
    @Body() dto: CreateTweetDto,
    @Request() req
  ): Promise<TweetResponseDto> {
    try {
      const command = new CreateTweetCommand(dto.content, req.user.id);
      const result = await this.createTweetUseCase.execute(command);
      
      return {
        success: true,
        data: result,
        message: 'Tweet created successfully'
      };
    } catch (error) {
      if (error instanceof DomainError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
```

## 🔄 Patterns to Follow

### 1. Command Pattern
```typescript
export class CreateTweetCommand {
  constructor(
    public readonly content: string,
    public readonly authorId: string
  ) {}
}
```

### 2. Factory Pattern
```typescript
export class TweetFactory {
  static create(content: string, authorId: string): Tweet {
    return new Tweet(
      TweetId.generate(),
      new TweetContent(content),
      new UserId(authorId)
    );
  }
}
```

### 3. Repository Pattern
```typescript
// Interface in domain/
export interface TweetRepository {
  save(tweet: Tweet): Promise<void>;
}

// Implementation in infrastructure/
export class MongoTweetRepository implements TweetRepository {
  async save(tweet: Tweet): Promise<void> { /* ... */ }
}
```

### 4. Dependency Injection
```typescript
// shared/tokens.ts
export const TOKENS = {
  TweetRepository: Symbol('TweetRepository'),
  UserRepository: Symbol('UserRepository'),
  EmailService: Symbol('EmailService'),
} as const;

// In the module
{
  provide: TOKENS.TweetRepository,
  useClass: MongoTweetRepository,
}
```

## 🚫 Forbidden Rules

### ❌ DO NOT in Domain:
- Use DB decorators (`@Schema`, `@Prop`, etc.)
- Import infrastructure libraries (Mongoose, TypeORM)
- Handle HTTP concerns (Request, Response)
- Access DB directly
- Serialization/deserialization logic

### ❌ DO NOT in Application:
- Direct access to DB models
- Handle HTTP details
- Import Mongoose schemas
- Presentation logic

### 🚫 DO NOT in Infrastructure:
- Complex business logic
- Domain validations
- Know other adapters directly

### 🔄 Bounded Context Communication Rules

#### ✅ ALLOWED Cross-Context Communication:
```typescript
// ✅ CORRECT: Application service calling another context
@Injectable()
export class CreateTweetUseCase {
  constructor(
    @Inject(TOKENS.TweetRepository) private tweetRepo: TweetRepository,
    @Inject(TOKENS.UserApplicationService) private userAppService: UserApplicationService
  ) {}

  async execute(command: CreateTweetCommand): Promise<TweetDto> {
    // Validate user exists in User context
    const userExists = await this.userAppService.userExists(command.authorId);
    if (!userExists) {
      throw new UserNotFoundError(command.authorId);
    }

    // Create tweet
    const tweet = new Tweet(
      TweetId.generate(),
      new TweetContent(command.content),
      new UserId(command.authorId)
    );

    await this.tweetRepo.save(tweet);
    return TweetMapper.toDto(tweet);
  }
}
```

#### ❌ FORBIDDEN Cross-Context Communication:
```typescript
// ❌ WRONG: Direct access to another context's repository
@Injectable()
export class CreateTweetUseCase {
  constructor(
    @Inject('UserRepository') private userRepo: UserRepository // ❌ Direct access
  ) {}
}

// ❌ WRONG: Domain entity knowing about other contexts' entities
export class Tweet {
  constructor(
    private user: User // ❌ Direct dependency on User entity
  ) {}
}
```

#### 🔗 Context Integration Patterns:
1. **Application Service Integration**: Use application services as facades
2. **Event-Driven**: Publish domain events for loose coupling
3. **Anti-Corruption Layer**: Use mappers for external data
4. **Shared Value Objects**: Only in shared/ folder

## 🧪 Testing Strategy

### Unit Tests (Domain)
```typescript
describe('Tweet Entity', () => {
  it('should create a valid tweet', () => {
    const tweet = new Tweet(
      new TweetId('123'),
      new TweetContent('Hello World'),
      new UserId('456')
    );
    
    expect(tweet.getContent()).toBe('Hello World');
  });

  it('should not allow empty content', () => {
    expect(() => {
      new TweetContent('');
    }).toThrow(InvalidTweetContentError);
  });
});
```

### Integration Tests (Application)
```typescript
describe('CreateTweetUseCase', () => {
  let useCase: CreateTweetUseCase;
  let mockTweetRepo: jest.Mocked<TweetRepository>;
  let mockUserRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockTweetRepo = createMockTweetRepository();
    mockUserRepo = createMockUserRepository();
    useCase = new CreateTweetUseCase(mockTweetRepo, mockUserRepo);
  });

  it('should create tweet successfully', async () => {
    mockUserRepo.findById.mockResolvedValue(createMockUser());
    
    const command = new CreateTweetCommand('Hello', 'user123');
    const result = await useCase.execute(command);
    
    expect(result.content).toBe('Hello');
    expect(mockTweetRepo.save).toHaveBeenCalled();
  });
});
```

## 📦 Dependency Injection

### Module Configuration
```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TweetModel.name, schema: TweetSchema }
    ])
  ],
  controllers: [TweetsController],
  providers: [
    // Use Cases
    CreateTweetUseCase,
    GetTweetsUseCase,
    
    // Repositories
    {
      provide: TOKENS.TweetRepository,
      useClass: MongoTweetRepository,
    },
    
    // Services
    TweetDomainService,
  ],
  exports: [TOKENS.TweetRepository],
})
export class TweetsModule {}
```

## ✅ Architecture Checklist

### Before writing code, verify:

#### 🏗️ Structure (Bounded Context)
- [ ] Is the code in the correct bounded context folder (users/, tweets/)?
- [ ] Is the entity in `{context}/domain/entities/`?
- [ ] Is the Value Object in `{context}/domain/value-objects/`?
- [ ] Is the repository interface in `{context}/domain/repositories/`?
- [ ] Is the implementation in `{context}/infrastructure/database/`?
- [ ] Is the use case in `{context}/application/use-cases/`?
- [ ] Is the mapper in `{context}/infrastructure/database/mappers/`?

#### 🎯 Dependencies (Hexagonal + DDD)
- [ ] Does domain NOT depend on infrastructure?
- [ ] Does domain NOT depend on other bounded contexts?
- [ ] Am I using dependency injection with tokens?
- [ ] Do mappers convert between layers correctly?
- [ ] Are interfaces in domain and implementations in infrastructure?
- [ ] Are cross-context calls through application services only?

#### 📋 Patterns (DDD + Hexagonal)
- [ ] Am I using Value Objects for validations?
- [ ] Do use cases orchestrate the logic within the context?
- [ ] Do controllers only handle HTTP?
- [ ] Do repositories only handle persistence?
- [ ] Are domain events used for cross-context communication?
- [ ] Is shared code only in shared/ folder?

#### 🧪 Testability (Per Context)
- [ ] Can I test domain without DB?
- [ ] Can I test context independently?
- [ ] Can I mock dependencies?
- [ ] Does each layer have independent tests?
- [ ] Do tests not depend on concrete implementations?
- [ ] Can I test cross-context integration separately?

#### 🏛️ Bounded Context Rules
- [ ] Does each context have its own domain model?
- [ ] Are contexts loosely coupled?
- [ ] Is context communication through well-defined interfaces?
- [ ] Are shared concepts only in shared/ folder?
- [ ] Does each context solve one specific business problem?

## 🚀 Incremental Migration (DDD Bounded Contexts)

### Current State vs Target
```typescript
// ❌ Current state (mixed concerns)
src/
├── users/
│   ├── schemas/user.schema.ts          # Mixed domain + infrastructure
│   ├── dto/user.dto.ts                 # Coupled to MongoDB
│   └── users.service.ts                # Mixed business + infrastructure logic
└── tweets/
    ├── schemas/tweet.schema.ts         # Mixed domain + infrastructure
    └── tweets.service.ts               # Mixed business + infrastructure logic

// ✅ Target state (DDD Bounded Contexts + Hexagonal)
src/
├── users/                              # Users Bounded Context
│   ├── domain/
│   │   ├── entities/user.entity.ts     # Pure domain logic
│   │   ├── value-objects/username.vo.ts
│   │   └── repositories/user.repository.ts
│   ├── application/
│   │   └── use-cases/create-user.use-case.ts
│   └── infrastructure/
│       ├── database/models/user.model.ts    # MongoDB-specific
│       └── http/controllers/users.controller.ts
└── tweets/                             # Tweets Bounded Context
    ├── domain/
    │   ├── entities/tweet.entity.ts    # Pure domain logic
    │   └── repositories/tweet.repository.ts
    ├── application/
    │   └── use-cases/create-tweet.use-case.ts
    └── infrastructure/
        ├── database/models/tweet.model.ts
        └── http/controllers/tweets.controller.ts
```

### Refactoring Order (Per Bounded Context)

#### Phase 1: Setup Context Structure
1. **Create bounded context folders** (users/, tweets/)
2. **Create layer folders** (domain/, application/, infrastructure/)
3. **Move existing files** to appropriate contexts
4. **Update imports** to reflect new structure

#### Phase 2: Users Context Refactoring
1. **Users Value Objects** (UserId, Username, Email, Password)
2. **User domain entity** (Pure TypeScript class)
3. **User repository interface** (Domain layer)
4. **User use cases** (CreateUser, FollowUser, etc.)
5. **User infrastructure models** (Mongoose schema)
6. **User repository implementation** (MongoDB adapter)
7. **User mappers** (Domain ↔ Infrastructure)
8. **Update users controller**
9. **Configure users dependency injection**

#### Phase 3: Tweets Context Refactoring
1. **Tweet Value Objects** (TweetId, TweetContent)
2. **Tweet domain entity** (Pure TypeScript class)
3. **Tweet repository interface** (Domain layer)
4. **Tweet use cases** (CreateTweet, LikeTweet, etc.)
5. **Tweet infrastructure models** (Mongoose schema)
6. **Tweet repository implementation** (MongoDB adapter)
7. **Tweet mappers** (Domain ↔ Infrastructure)
8. **Update tweets controller**
9. **Configure tweets dependency injection**

#### Phase 4: Context Integration
1. **Define cross-context interfaces** (Application services)
2. **Implement anti-corruption layers** (Mappers for external data)
3. **Setup domain events** (For loose coupling)
4. **Update shared folder** (Common value objects, exceptions)
5. **Integration tests** (Cross-context scenarios)

### Migration Strategy per Context
- **Start with Users context** (foundational)
- **Then Tweets context** (depends on Users)
- **Each context can be migrated independently**
- **No breaking changes to existing API**
- **Gradual replacement of old services**

---

## 🎯 GitHub Copilot Reminder

**When you request code, always:**
1. 📖 **Read this file** for architectural context
2. 🏗️ **Apply hexagonal architecture** according to these rules
3. 🔄 **Separate concerns** in the correct layers
4. 🧪 **Make code testable** and interchangeable
5. ✅ **Validate against checklist** before delivering

**Explicit mention:** *"Apply the rules from AGENT-RULES/ARCHITECTURE_RULES.md"*