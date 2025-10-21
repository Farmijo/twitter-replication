# Twitter-like API with NestJS and MongoDB

Basic REST API that simulates Twitter functionality, built with NestJS, MongoDB and Docker.

## Init disclaimer
This is a 100% self-fulfilling/learning project. Most of the solutions here are are overengineered and probably wouldn't make sense on an 
enterprise level. 

## Features

- **JWT Authentication**: Complete login/register system with tokens
- **Role-based Authorization**: Admin vs User with differentiated permissions
- **User Management**: Registration, query, update and deletion
- **Tweet System**: Create, read, update and delete tweets
- **Social Features**: Like, retweet, hashtags and mentions
- **Security**: Password hashing with bcrypt, route protection
- **Automatic Validation**: DTOs with class-validator
- **Database**: MongoDB with Mongoose
- **Containerization**: Docker and Docker Compose
- **Pagination**: On listing endpoints
- **Automatic Population**: Relations between users and tweets

## Project Structure

```
twitter-alike/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts       # Authentication endpoints
│   │   ├── auth.service.ts          # Auth logic and JWT
│   │   ├── auth.module.ts           # Authentication module
│   │   ├── jwt.strategy.ts          # JWT Passport strategy
│   │   ├── jwt-auth.guard.ts        # Guard to protect routes
│   │   └── admin.guard.ts           # Guard for admin routes
│   ├── users/
│   │   ├── dto/
│   │   │   └── user.dto.ts          # DTOs for validation + auth
│   │   ├── schemas/
│   │   │   └── user.schema.ts       # Schema with roles and bcrypt
│   │   ├── users.controller.ts      # Protected REST controller
│   │   ├── users.service.ts         # Business logic
│   │   └── users.module.ts          # NestJS module
│   ├── tweets/
│   │   ├── dto/
│   │   │   └── tweet.dto.ts         # DTOs for validation
│   │   ├── schemas/
│   │   │   └── tweet.schema.ts      # MongoDB schema
│   │   ├── tweets.controller.ts     # Protected REST controller
│   │   ├── tweets.service.ts        # Business logic
│   │   └── tweets.module.ts         # NestJS module
│   ├── app.module.ts                # Main module with auth
│   └── main.ts                      # Entry point
├── docker-compose.yml               # Services orchestration
├── Dockerfile                       # Application image
├── mongo-init.js                    # MongoDB initialization script
├── package.json                     # Project dependencies
└── README.md                        # Documentation
```

## Technologies Used

- **NestJS**: Node.js framework
- **JWT**: Authentication with JSON Web Tokens
- **Passport**: Authentication strategies
- **bcryptjs**: Secure password hashing
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **Docker**: Containerization
- **class-validator**: DTO validation
- **TypeScript**: Static typing

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Installation and Execution

### With Docker (Recommended)

1. **Clone and navigate to project:**
   ```bash
   cd /Users/fran.armijo/Desktop/personal/Learning/Typescript/twitter-alike
   ```

2. **Setup environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration (see ENVIRONMENT.md for details)
   ```

3. **Start services:**
   ```bash
   docker-compose up --build
   ```

4. **API will be available at:**
   - API: http://localhost:3000/api
   - MongoDB: localhost:27017

### Without Docker (Local development)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start MongoDB locally** (make sure you have MongoDB running)

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration (see ENVIRONMENT.md for details)
   ```

4. **Run in development mode:**
   ```bash
   npm run start:dev
   ```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Protection |
|--------|----------|-------------|------------|
| POST | `/api/auth/register` | Register user | Public |
| POST | `/api/auth/login` | User login | Public |
| GET | `/api/auth/profile` | Get user profile | JWT |
| PATCH | `/api/auth/change-password` | Change password | JWT |
| PATCH | `/api/auth/promote/:userId` | Promote user to admin | JWT + Admin |
| PATCH | `/api/auth/deactivate/:userId` | Deactivate user | JWT + Admin |
| GET | `/api/auth/verify` | Verify valid token | JWT |

### Users

| Method | Endpoint | Description | Protection |
|--------|----------|-------------|------------|
| GET | `/api/users` | Get all users | JWT + Admin |
| GET | `/api/users/:id` | Get user by ID | JWT |
| GET | `/api/users/username/:username` | Get user by username | Public |
| GET | `/api/users/email/:email` | Get user by email | JWT + Admin |
| PATCH | `/api/users/:id` | Update user | JWT (own/admin) |
| DELETE | `/api/users/:id` | Delete user | JWT + Admin |
| PATCH | `/api/users/:id/follow` | Increment followers | JWT |
| PATCH | `/api/users/:id/following` | Increment following | JWT |

### Tweets

| Method | Endpoint | Description | Protection |
|--------|----------|-------------|------------|
| POST | `/api/tweets` | Create tweet | JWT |
| GET | `/api/tweets` | Get all tweets | Public |
| GET | `/api/tweets/:id` | Get tweet by ID | Public |
| GET | `/api/tweets/user/:userId` | Get user tweets | Public |
| GET | `/api/tweets/hashtag/:hashtag` | Get tweets by hashtag | Public |
| PATCH | `/api/tweets/:id` | Update tweet | JWT (own/admin) |
| DELETE | `/api/tweets/:id` | Delete tweet | JWT (own/admin) |
| POST | `/api/tweets/:id/like` | Like tweet | JWT |
| POST | `/api/tweets/:id/retweet` | Retweet | JWT |

## Usage Examples

### Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "bio": "Slightly passionated developer"
  }'
```

### User Login

```bash
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "john_doe",
    "password": "password123"
  }'
```

### Create Tweet (Requires authentication)

```bash
curl -X POST http://localhost:3000/api/tweets \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "content": "Hello world!"
  }'
```

### Get Profile (Requires authentication)

```bash
curl -X GET http://localhost:3000/api/auth/profile \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get All Users (Admin Only)

```bash
curl -X GET http://localhost:3000/api/users \\
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Search by Hashtag (Public)

```bash
curl "http://localhost:3000/api/tweets/hashtag/nestjs"
```

## 🗄️ Database Schemas

### User

```typescript
{
  username: string;        // unique
  email: string;          // unique
  password: string;       // hashed with bcrypt
  role: 'user' | 'admin'; // UserRole enum
  bio?: string;
  profileImage?: string;
  followersCount: number; // default: 0
  followingCount: number; // default: 0
  isActive: boolean;      // default: true
  createdAt: Date;
  updatedAt: Date;
}
```

### Tweet

```typescript
{
  content: string;             // maximum 280 characters
  userId: ObjectId;           // reference to User
  likesCount: number;         // default: 0
  retweetsCount: number;      // default: 0
  repliesCount: number;       // default: 0
  hashtags: string[];         // automatically extracted
  mentions: string[];         // automatically extracted
  isRetweet: boolean;         // default: false
  originalTweetId?: ObjectId; // for retweets
  createdAt: Date;
  updatedAt: Date;
}
```

##  Useful Commands

```bash
# Build application
npm run build

# Run tests
npm run test

# View container logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean volumes
docker-compose down -v

# Access MongoDB
docker exec -it mongodb-test mongosh -u admin -p password123
```

## Debugging

### Connect to MongoDB from container:

```bash
docker exec -it mongodb-test mongosh
use twitterdb
db.users.find()
db.tweets.find()
```

### View application logs:

```bash
docker-compose logs -f api
```

## Authentication System

### User Roles
- **USER**: Normal user (can create tweets, update their profile)
- **ADMIN**: Administrator (full access, can view all users, promote users)

### Authentication Flow
1. **Register**: `/api/auth/register` - First registered user is automatically admin
2. **Login**: `/api/auth/login` - Returns JWT token valid for 7 days
3. **Protection**: Protected routes require `Authorization: Bearer <token>` header
4. **Roles**: Some routes require admin role in addition to authentication

### Required Headers
```bash
# For JWT protected routes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Content-Type for POST/PATCH
Content-Type: application/json
```

## Automatic Features

- **Password hashing**: Automatic with bcrypt when saving user
- **UserId assignment**: Automatically taken from JWT token
- **First user admin**: First registered user is automatically admin
- **Hashtag extraction**: Hashtags (#) are automatically extracted from content
- **Mention extraction**: Mentions (@) are automatically extracted from content
- **Timestamps**: Automatically managed `createdAt` and `updatedAt`
- **Validation**: All DTOs have automatic validation
- **Population**: Relations are automatically populated in queries
- **Route protection**: Automatic guards for JWT and admin

##  Next Steps Roadmap

This basic API is ready to evolve into an enterprise-level system. Here's the technical roadmap organized by phases:

### **🏗️ Phase 1: Performance & Caching (Immediate Impact)**
**Goal**: Reduce latency from 100ms+ to <50ms p95

- [ ] **Redis Cache Layer**
  - JWT session cache (eliminate DB hit on every request)
  - Popular tweets cache with intelligent TTL
  - Counter cache (likes, retweets) with write-through strategy
- [ ] **Database Optimization**
  - Compound indexes: `{userId: 1, createdAt: -1}`, `{hashtags: 1}`
  - Connection pooling with environment-specific limits
  - Read replicas for timeline queries
- [ ] **Basic Monitoring**
  - Prometheus + Grafana for performance metrics
  - Health checks and circuit breakers

### **🔄 Phase 2: Real-time & Event Architecture**
**Goal**: Real-time features + scalable architecture

- [ ] **WebSocket Implementation**
  - Push notifications (new followers, likes, mentions)
  - Real-time timeline updates
  - Presence system (user online/offline)
- [ ] **Event-Driven Architecture**
  - Message queues (Bull/RabbitMQ) for async processing
  - Event sourcing for complete audit log
  - CQRS pattern to separate writes from reads
- [ ] **Timeline Generation System**
  - Fan-out on write for normal users (<1K followers)
  - Fan-out on read for celebrities (>1K followers)
  - Hybrid approach with background jobs

### **📊 Phase 3: Advanced Features & ML**
**Goal**: Complete social platform functionality

- [ ] **Complete Following System**
  - Graph database or optimized MongoDB representation
  - Follow recommendations based on mutual connections
  - Performance limits (max 5K following)
- [ ] **Search & Discovery**
  - Elasticsearch cluster for full-text search
  - Trending topics algorithm with time-decay
  - Basic ML content recommendations
- [ ] **Media Handling**
  - Image/video upload to S3/CloudStorage
  - Image optimization and CDN integration
  - Video transcoding for multiple qualities

### **🛡️ Phase 4: Security & Moderation**
**Goal**: Secure and moderated platform

- [ ] **Advanced Authentication**
  - Refresh tokens with automatic rotation
  - 2FA with TOTP/SMS
  - OAuth integration (Google, GitHub, Twitter)
- [ ] **Content Moderation**
  - ML moderation for toxic content
  - User reporting workflow
  - Distributed rate limiting with Redis
  - Pattern-based spam detection
- [ ] **Compliance & Privacy**
  - GDPR compliance (data export/deletion)
  - Complete audit logging
  - Data encryption at rest and in transit

### **⚡ Phase 5: Microservices & Scale**
**Goal**: Distributed architecture for millions of users

- [ ] **Service Decomposition**
  ```
  User Service    Tweet Service    Feed Service
       |               |               |
  Notification   Media Service   Analytics Service
  ```
- [ ] **Infrastructure as Code**
  - Kubernetes deployment with auto-scaling
  - Terraform for provisioning
  - CI/CD pipelines with automated testing
  - Blue-green deployments
- [ ] **Advanced Caching**
  - Multi-tier caching (L1: in-memory, L2: Redis, L3: DB)
  - Edge caching with CDN
  - Cache invalidation strategies

### **📈 Phase 6: Analytics & Business Intelligence**
**Goal**: Data-driven platform with deep insights

- [ ] **Analytics Pipeline**
  - Data warehouse (ClickHouse/BigQuery)
  - ETL pipelines with Airflow
  - Real-time analytics with Kafka Streams
- [ ] **ML & Personalization**
  - Personalized timeline ranking algorithm
  - Content recommendation engine
  - A/B testing framework for features
- [ ] **Business Metrics**
  - DAU/MAU tracking
  - Engagement metrics and cohort analysis
  - Revenue optimization (ads, subscriptions)

### **🔧 Technical KPIs to Track**

| Metric | Current Baseline | Staff Engineer Target |
|---------|-----------------|----------------------|
| Timeline Load Time | ~200ms | <50ms p95 |
| Tweet Creation | ~100ms | <30ms p95 |
| Search Queries | N/A | <100ms p95 |
| System Availability | 95% | 99.95% |
| Cache Hit Ratio | 0% | >90% |
| Deploy Frequency | Manual | Multiple/day |
| Error Rate | Unknown | <0.1% |
| Cost per User | N/A | Optimize monthly |

### **🚀 Target Final Architecture**

```
                    Load Balancer (nginx)
                           |
                    API Gateway (Kong)
                           |
        ┌─────────────────┬─────────────────┬─────────────────┐
        │                 │                 │                 │
   User Service    Tweet Service    Feed Service    Media Service
        │                 │                 │                 │
        └─────────────────┼─────────────────┼─────────────────┘
                          │                 │
                    Message Queue     Cache Layer (Redis)
                    (RabbitMQ)             │
                          │                 │
                    Background Jobs   Database Cluster
                    (Bull Queue)      (MongoDB Sharded)
```

## � Upcoming Improvements

- [x] JWT Authentication ✅
- [x] Admin/User Role System ✅
- [x] Protected Route Security ✅
- [x] Secure Password Hashing ✅
- [ ] Real followers/following system
- [ ] Tweet replies (threading)
- [ ] Image upload
- [ ] Rate limiting
- [ ] Unit and integration tests
- [ ] Swagger documentation
- [ ] Notification system
- [ ] Advanced search
- [ ] Redis caching
- [ ] Refresh tokens
- [ ] OAuth (Google, GitHub)

##  License
Use this however you like