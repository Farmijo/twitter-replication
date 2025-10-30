import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { UserRole } from '../../users/domain/entities/user.entity';

export interface CachedUserSnapshot {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  bio: string;
  profileImage: string;
  followersCount: number;
  followingCount: number;
}

interface CachedAuthToken {
  userId: string;
  snapshot: CachedUserSnapshot;
}

@Injectable()
export class AuthTokenCacheService {
  private readonly logger = new Logger(AuthTokenCacheService.name);
  private readonly TOKEN_PREFIX = 'auth:token:';
  private readonly USER_TOKEN_SET_PREFIX = 'auth:user:';

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async storeToken(jti: string, snapshot: CachedUserSnapshot, ttlInSeconds?: number): Promise<void> {
    if (!jti) {
      return;
    }

    try {
      const key = this.buildTokenKey(jti);
      const ttl = typeof ttlInSeconds === 'number' && ttlInSeconds > 0 ? Math.ceil(ttlInSeconds) : undefined;

      if (!ttl) {
        this.logger.warn('Skipping auth token caching because TTL is missing or invalid');
        return;
      }
    // NOTE: El snapshot se persiste aquí pero su actualización depende de eventos asíncronos.
    // El módulo de auth no actualiza perfiles directamente para mantener la separación de responsabilidades.
      await this.cacheManager.set(key, { userId: snapshot.id, snapshot }, ttl);
      await this.registerTokenForUser(snapshot.id, jti, ttl);
    } catch (error) {
      this.logger.warn(`Failed to store auth token in cache: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async isTokenActive(jti: string): Promise<boolean> {
    if (!jti) {
      return false;
    }

    try {
      const key = this.buildTokenKey(jti);
      const cached = await this.cacheManager.get<CachedAuthToken>(key);
      return Boolean(cached);
    } catch (error) {
      this.logger.warn(`Failed to read auth token from cache: ${error instanceof Error ? error.message : String(error)}`);
      return true;
    }
  }

  async invalidateToken(jti: string, fallbackUserId?: string): Promise<void> {
    if (!jti) {
      return;
    }

    try {
      const key = this.buildTokenKey(jti);
      const cached = await this.cacheManager.get<CachedAuthToken>(key);
      await this.cacheManager.del(key);

      const userId = cached?.userId ?? fallbackUserId;
      if (userId) {
        await this.removeTokenFromUserSet(userId, jti);
      }
    } catch (error) {
      this.logger.warn(`Failed to invalidate auth token in cache: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateUserSnapshot(snapshot: CachedUserSnapshot): Promise<void> {
    const client = this.getRedisClient();
    if (!client) {
      return;
    }

    try {
      const userTokensKey = this.buildUserTokensKey(snapshot.id);
      const tokenIds: string[] = await client.smembers(userTokensKey);

      if (!Array.isArray(tokenIds) || tokenIds.length === 0) {
        return;
      }

      for (const jti of tokenIds) {
        const tokenKey = this.buildTokenKey(jti);
        const ttl = await client.ttl(tokenKey);

        if (ttl === -2) {
          await client.srem(userTokensKey, jti);
          continue;
        }

        if (ttl > 0) {
          await this.cacheManager.set(tokenKey, { userId: snapshot.id, snapshot }, ttl);
        } else {
          await this.cacheManager.set(tokenKey, { userId: snapshot.id, snapshot });
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to update user snapshot in cache: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async invalidateAllTokensForUser(userId: string): Promise<void> {
    const client = this.getRedisClient();
    if (!client) {
      return;
    }

    try {
      const userTokensKey = this.buildUserTokensKey(userId);
      const tokenIds: string[] = await client.smembers(userTokensKey);

      if (Array.isArray(tokenIds)) {
        for (const jti of tokenIds) {
          await this.invalidateToken(jti, userId);
        }
      }

      await client.del(userTokensKey);
    } catch (error) {
      this.logger.warn(`Failed to invalidate user tokens in cache: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private buildTokenKey(jti: string): string {
    return `${this.TOKEN_PREFIX}${jti}`;
  }

  private buildUserTokensKey(userId: string): string {
    return `${this.USER_TOKEN_SET_PREFIX}${userId}:tokens`;
  }

  private async registerTokenForUser(userId: string, jti: string, ttl: number): Promise<void> {
    const client = this.getRedisClient();
    if (!client) {
      return;
    }

    try {
      const userTokensKey = this.buildUserTokensKey(userId);
      await client.sadd(userTokensKey, jti);
      if (ttl > 0) {
        const currentTtl = await client.ttl(userTokensKey);
        if (currentTtl === -1 || currentTtl < ttl) {
          await client.expire(userTokensKey, ttl);
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to register token in user set: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async removeTokenFromUserSet(userId: string, jti: string): Promise<void> {
    const client = this.getRedisClient();
    if (!client) {
      return;
    }

    try {
      const userTokensKey = this.buildUserTokensKey(userId);
      await client.srem(userTokensKey, jti);
    } catch (error) {
      this.logger.warn(`Failed to remove token from user set: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private getRedisClient(): any {
    const store = this.cacheManager.stores as unknown as { client?: any };
    return store?.client;
  }
}
