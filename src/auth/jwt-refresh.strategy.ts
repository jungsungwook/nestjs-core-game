import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
    Strategy,
    'jwt-refresh-token',
) {
    constructor(
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request) => {
                    return request?.cookies?.Refresh;
                },
            ]),
            secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET,
            passReqToCallback: true,
        });
    }

    async validate(req, payload: any) {
        const refreshToken = req.cookies?.Refresh;
        return this.authService.getUserIfRefreshTokenMatches(
            refreshToken,
            payload.id,
        );
    }
}