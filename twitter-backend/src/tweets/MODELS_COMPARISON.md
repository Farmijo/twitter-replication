# 📊 Tweet Models Comparison

## 🎯 Domain Model vs MongoDB Model

### ✅ Domain Model (Pure Business Logic)
**Location:** `src/tweets/domain/entities/tweet.entity.ts`

```typescript
export class Tweet {
  // Pure domain logic - NO database decorators
  constructor(
    private readonly id: TweetId,           // ✅ Value Object
    private content: TweetContent,          // ✅ Value Object with validation
    private readonly authorId: UserId,      // ✅ Value Object
    private readonly type: TweetType,       // ✅ Enum
    private readonly originalTweetId: TweetId | null,
    private readonly parentTweetId: TweetId | null,
    private readonly createdAt: Date,
    private likesCount: number,
    private retweetsCount: number,
    private repliesCount: number
  ) {
    // ✅ Business validation in constructor
    this.validateBusinessRules();
  }

  // ✅ Business methods
  public like(): void { /* business logic */ }
  public updateContent(content: string): void { /* validation + logic */ }
  public canBeEditedBy(userId: UserId): boolean { /* business rules */ }
  
  // ✅ Factory methods
  public static createOriginalTweet(...): Tweet { /* ... */ }
  public static createRetweet(...): Tweet { /* ... */ }
}
```

**Characteristics:**
- ✅ **Pure TypeScript class** (no framework dependencies)
- ✅ **Value Objects** for type safety and validation
- ✅ **Business logic encapsulation** 
- ✅ **Domain rules validation**
- ✅ **Factory methods** for different tweet types
- ✅ **Immutable IDs** and core properties
- ✅ **Rich behavior** (like, edit, validate permissions)

---

### 🔧 MongoDB Model (Persistence Concerns)
**Location:** `src/tweets/infrastructure/database/mongodb/models/tweet.model.ts`

```typescript
@Schema({ 
  collection: 'tweets',
  timestamps: true,
  toJSON: { transform: ... }  // ✅ MongoDB-specific transformations
})
export class TweetModel {
  // MongoDB-specific decorators and types
  @Prop({ required: true })
  content: string;                        // ❌ Plain string (no validation)

  @Prop({ type: Types.ObjectId, required: true, index: true })
  authorId: Types.ObjectId;               // ❌ MongoDB ObjectId

  @Prop({ type: String, enum: TweetTypeModel, default: 'original' })
  type: TweetTypeModel;                   // ❌ String enum for DB

  @Prop({ type: Types.ObjectId, default: null, index: true })
  originalTweetId: Types.ObjectId | null;

  @Prop({ default: 0, min: 0 })
  likesCount: number;                     // ❌ Simple number (no encapsulation)

  @Prop({ type: [String], default: [], index: true })
  hashtags: string[];                     // ❌ Plain array

  // MongoDB-specific fields
  @Prop({ default: false })
  isDeleted: boolean;                     // ✅ Persistence concern

  createdAt: Date;                        // ✅ Mongoose timestamps
  updatedAt: Date;                        // ✅ Mongoose timestamps
}

// ✅ Database performance optimizations
TweetSchema.index({ authorId: 1, createdAt: -1 });
TweetSchema.index({ hashtags: 1, createdAt: -1 });
```

**Characteristics:**
- ✅ **Mongoose decorators** for persistence
- ✅ **Database indexes** for performance
- ✅ **MongoDB-specific types** (ObjectId, etc.)
- ❌ **No business logic** (anemic model)
- ❌ **No validation** (delegated to domain)
- ✅ **Persistence concerns** (soft delete, timestamps)
- ✅ **Query optimization** indexes

---

## 🔄 Mapper (Domain ↔ MongoDB)
**Location:** `src/tweets/infrastructure/database/mongodb/mappers/tweet.mapper.ts`

```typescript
export class TweetMapper {
  // Domain → MongoDB
  static toPersistence(domainTweet: Tweet): any {
    return {
      _id: new Types.ObjectId(domainTweet.getId().getValue()),
      content: domainTweet.getContent(),              // Extract from Value Object
      authorId: new Types.ObjectId(domainTweet.getAuthorId().getValue()),
      hashtags: domainTweet.getHashtags(),            // Extract from domain
      // ... map all fields
    };
  }

  // MongoDB → Domain
  static toDomain(persistenceModel: TweetDocument): Tweet {
    const id = TweetId.fromString(persistenceModel._id.toString());
    const content = new TweetContent(persistenceModel.content);     // Create Value Object
    const authorId = UserId.fromString(persistenceModel.authorId.toString());
    
    return new Tweet(id, content, authorId, ...);                   // Rich domain object
  }
}
```

---

## 📋 Key Differences Summary

| Aspect | Domain Model | MongoDB Model |
|--------|-------------|---------------|
| **Purpose** | Business logic | Data persistence |
| **Dependencies** | None (pure TypeScript) | Mongoose, MongoDB |
| **Validation** | Rich domain validation | Basic schema validation |
| **Behavior** | Rich methods & business rules | Anemic (no behavior) |
| **Types** | Value Objects, Enums | Primitive types, ObjectIds |
| **Immutability** | Enforced where needed | Mutable document |
| **Performance** | Optimized for business logic | Optimized for DB queries |
| **Testing** | Easy to unit test | Requires DB connection |

## 🎯 Benefits of This Separation

### ✅ **Domain Model Benefits:**
- **Testability**: No database dependencies
- **Business Logic**: All rules in one place
- **Type Safety**: Value Objects prevent invalid states
- **Maintainability**: Changes don't affect persistence
- **Reusability**: Can work with any persistence layer

### ✅ **MongoDB Model Benefits:**
- **Performance**: Optimized indexes and queries
- **Persistence**: Handles DB-specific concerns
- **Flexibility**: Can change without affecting domain
- **Scalability**: DB-specific optimizations
- **Framework Integration**: Works seamlessly with NestJS

### ✅ **Mapper Benefits:**
- **Decoupling**: Domain and persistence are independent
- **Flexibility**: Can swap databases without changing domain
- **Transformation**: Handles complex type conversions
- **Anti-corruption**: Protects domain from external changes

---

## 🚀 Usage Example

```typescript
// 1. Create domain entity (business logic)
const tweet = Tweet.createOriginalTweet(
  TweetId.generate(),
  new TweetContent("Hello #typescript world!"),
  UserId.fromString("user123")
);

// 2. Business operations
tweet.like();
if (tweet.canBeEditedBy(userId)) {
  tweet.updateContent("Updated content");
}

// 3. Persist using mapper (infrastructure concern)
const mongoData = TweetMapper.toPersistence(tweet);
await tweetModel.create(mongoData);

// 4. Retrieve and convert back to domain
const doc = await tweetModel.findById(id);
const domainTweet = TweetMapper.toDomain(doc);
```

This separation allows us to:
- **Change databases** without touching business logic
- **Add new features** in the domain without DB changes  
- **Optimize queries** without affecting domain rules
- **Test business logic** without database dependencies