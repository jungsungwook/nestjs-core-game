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
                    if(request?.headers?.refresh_token){
                        return request?.headers?.refresh_token;
                    }
                    return request?.cookies?.Refresh;
                },
            ]),
            secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET,
            passReqToCallback: true,
        });
    }

    async validate(req, payload: any) {
        const refreshToken = req.cookies?.Refresh || req.headers?.refresh_token;
        return this.authService.getUserIfRefreshTokenMatches(
            refreshToken,
            payload.id,
        );
    }
}