import { Body, Controller, Post, ValidationPipe, UseGuards, UseInterceptors, Get, Req, Res } from '@nestjs/common';
import { User } from 'src/pages/users/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthCredentialDto } from './dto/auth-credential.dto';
import { GetUser } from './get-user.decorator';
import { AuthLoginDto } from './dto/auth-login.dto';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiResponse } from '@nestjs/swagger';
import { DefaultResponseDto } from './dto/default-response.dto';
import { ErrorResponseDto } from './dto/error-response.dto';
import { TransactionInterceptor } from 'src/decorators/TransactionInterceptor.decorator';
import { TransactionManager } from 'src/decorators/TransactionManager.decorator';
import { EntityManager } from 'typeorm';

@Controller('auth')
@UseInterceptors(TransactionInterceptor)
@ApiTags('유저 인증')
export class AuthController {
    constructor(
        private authService: AuthService
    ) {}
    @Post('/signup')
    @ApiOperation({summary: '회원가입', description: '회원가입 진행'})
    @ApiResponse({description: '회원가입 성공', type: DefaultResponseDto, status: 201})
    @ApiResponse({description: '회원가입 실패', type: ErrorResponseDto , status: 401})
    async signUp(
        @Body(ValidationPipe) authCredentialDto: AuthCredentialDto,
        @TransactionManager() queryRunnerManager: EntityManager,
    ): Promise<DefaultResponseDto> {
        try{
            const result = await this.authService.signUp({
                authCredentialDto,
                queryRunner:queryRunnerManager,
            });
            return result;
        }catch(error){
            const result:DefaultResponseDto = new DefaultResponseDto();
            result.statusCode = "401";
            result.contents = error.message;
            return result;
        }
    }

    @Post('/signin')
    @ApiOperation({summary: '로그인', description: '로그인 진행'})
    @ApiResponse({description: '로그인 성공', type: DefaultResponseDto})
    @ApiResponse({description: '로그인 실패', type: ErrorResponseDto , status: 401})
    async signIn(
        @Body(ValidationPipe) authLoginDto: AuthLoginDto,
        @TransactionManager() queryRunnerManager: EntityManager,
        @Res({ passthrough: true }) response,
    ): Promise<DefaultResponseDto> {
        try{
            const result = await this.authService.signIn({
                authLoginDto,
                queryRunnerManager,
            });
            response.cookie('Refresh', result.contents.refreshToken, {
                httpOnly: true,
                maxAge: process.env.JWT_REFRESH_EXPIRATION_TIME,
            });
            return {
                statusCode: result.statusCode,
                contents: result.contents.accessToken,
            };
        }catch(error){
            const result:DefaultResponseDto = new DefaultResponseDto();
            result.statusCode = "404";
            result.contents = error.message;
            return result;
        }
    }

    @Get('/signout')
    @ApiOperation({summary: '로그아웃', description: '로그아웃 진행'})
    @ApiResponse({description: '로그아웃 성공', type: DefaultResponseDto})
    @ApiResponse({description: '로그아웃 실패', type: ErrorResponseDto , status: 401})
    async signOut(
        @Res({ passthrough: true }) response,
        @GetUser() user: User,
    ): Promise<DefaultResponseDto> {
        try{
            if(!user) throw new Error('로그인이 되어있지 않습니다.');
            await this.authService.signOut(user);
            response.clearCookie('Refresh');
            return {
                statusCode: "200",
                contents: "로그아웃 성공",
            };
        }catch(error){
            const result:DefaultResponseDto = new DefaultResponseDto();
            result.statusCode = "500";
            result.contents = error.message;
            return result;
        }
    }

    @Get('/refresh')
    @ApiOperation({summary: 'Refresh Token 으로 AccessToken 발급', description: 'Refresh Token 으로 AccessToken 발급'})
    @ApiResponse({description: '로그인 성공', type: DefaultResponseDto})
    @ApiResponse({description: '로그인 실패', type: ErrorResponseDto , status: 401})
    @UseGuards(AuthGuard('jwt-refresh-token'))
    async signInByRefreshToken(
        @TransactionManager() queryRunnerManager: EntityManager,
        @GetUser() user: User,
    ): Promise<DefaultResponseDto> {
        try{
            const accessToken = await this.authService.getAccessToken(user);
            return {
                statusCode: "200",
                contents: accessToken,
            };
        }catch(error){
            const result:DefaultResponseDto = new DefaultResponseDto();
            result.statusCode = "500";
            result.contents = error.message;
            return result;
        }
    }

    @Get('/islogin')
    @ApiOperation({summary: '로그인 여부 확인', description: '로그인 여부 확인'})
    @ApiResponse({description: '로그인 여부 확인', type: DefaultResponseDto})
    @UseGuards(AuthGuard("jwt"))
    async isLogin(
        @GetUser() user: User,
    ): Promise<DefaultResponseDto> {
        try{
            return {
                statusCode: "200",
                contents: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    customId: user.customId,
                },
            };
        }catch(error){
            const result:DefaultResponseDto = new DefaultResponseDto();
            result.statusCode = "500";
            result.contents = error.message;
            return result;
        }
    }
}
