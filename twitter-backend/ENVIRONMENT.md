# Environment Configuration

This project uses environment variables for sensitive configuration. 

## Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual values:
   ```bash
   # Database Configuration
   MONGODB_URI=mongodb://your-username:your-password@localhost:27017/your-database?authSource=admin
   
   # JWT Configuration  
   JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
   JWT_EXPIRES_IN=7d
   
   # App Configuration
   NODE_ENV=development
   PORT=3000

   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   REDIS_DB=0
   
   # MongoDB Container Configuration (for docker-compose)
   MONGO_INITDB_ROOT_USERNAME=your-mongo-username
   MONGO_INITDB_ROOT_PASSWORD=your-mongo-password
   MONGO_INITDB_DATABASE=your-database-name
   ```


## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://admin:password123@localhost:27017/twitterdb?authSource=admin` | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key-change-this` | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration time | `7d` | No |
| `NODE_ENV` | Application environment | `development` | No |
| `PORT` | Application port | `3000` | No |
| `REDIS_HOST` | Redis host | `localhost` | No |
| `REDIS_PORT` | Redis port | `6379` | No |
| `REDIS_PASSWORD` | Redis password | _empty_ | No |
| `REDIS_DB` | Redis database index | `0` | No |
| `MONGO_INITDB_ROOT_USERNAME` | MongoDB root username | `admin` | No |
| `MONGO_INITDB_ROOT_PASSWORD` | MongoDB root password | `password123` | No |
| `MONGO_INITDB_DATABASE` | MongoDB initial database | `twitterdb` | No |
