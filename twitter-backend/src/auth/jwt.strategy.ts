import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, JwtPayload } from './auth.service';
import { AuthTokenCacheService } from './services/auth-token-cache.service';
import { UserDocument } from '../users/infrastructure/database/mongodb/models/user.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private readonly authTokenCacheService: AuthTokenCacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-this-in-production',
    });
  }

  async validate(payload: JwtPayload): Promise<UserDocument> {
    if (!payload?.jti) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const tokenActive = await this.authTokenCacheService.isTokenActive(payload.jti);
    if (!tokenActive) {
      throw new UnauthorizedException('Token has been revoked');
    }

    const user = await this.authService.validateUser(payload);
    (user as UserDocument & { tokenId?: string }).tokenId = payload.jti;

    return user;
  }
}