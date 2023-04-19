import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/pages/users/user.entity';
import { UserRepository } from 'src/pages/users/user.repository';
import { AuthCredentialDto } from './dto/auth-credential.dto';
import { UnauthorizedException } from "@nestjs/common/exceptions";
import * as bcrypt from 'bcryptjs';
import { AuthLoginDto } from './dto/auth-login.dto';
import { DefaultResponseDto } from './dto/default-response.dto';
import { EntityManager } from 'typeorm';
import { generateRandomString } from 'src/utils/commonUtils';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        private jwtService: JwtService
    ) {}

    async signUp(args:{
        authCredentialDto: AuthCredentialDto,
        queryRunner: EntityManager,
    }) : Promise<DefaultResponseDto> {
        try{
            const IdCheck = await args.queryRunner.findOne(User,{
                where:{ customId : args.authCredentialDto.customId }
            });
            if(IdCheck){
                throw new UnauthorizedException('Id already exists');
            }

            const EmailCheck = await args.queryRunner.findOne(User,{
                where:{ email : args.authCredentialDto.email }
            });
            if(EmailCheck){
                throw new UnauthorizedException('Email already exists');
            }
        } catch (error) {
            throw new UnauthorizedException(error.message);
        }
        const user = await this.userRepository.createUser(args.authCredentialDto);
        return {statusCode:"200", contents : user};
    }

    async signIn(args:{
        authLoginDto: AuthLoginDto,
        queryRunnerManager: EntityManager,
    }) : Promise<DefaultResponseDto> {
        const {customId , password } = args.authLoginDto;
        const user = await this.userRepository.findOne(
            {where:{ customId : customId }}
        );

        if(user && await bcrypt.compare(password, user.password)){
            const payload = { customId : user.customId };
            const accessToken = await this.jwtService.sign(payload);
            const refreshToken = await this.jwtService.sign({}, { 
                secret: process.env.JWT_REFRESH_TOKEN_SECRET,
                expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
            });

            await this.setCurrentRefreshToken(refreshToken, user.id)

            return {statusCode:"200", contents : {accessToken, refreshToken}};
        }
        else{
            throw new UnauthorizedException('login failed');
        }
    }

    async setCurrentRefreshToken(refreshToken: string, id: number) {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.userRepository.update(id, { refreshToken : hashedRefreshToken });
    }
    
    async getUserIfRefreshTokenMatches(refreshToken: string, id: number) {
        const user = await this.userRepository.findOne({
            where: { id },
        });

        if(user.refreshToken == null){
            throw new UnauthorizedException('refresh token is null');
        }
    
        const isRefreshTokenMatching = await bcrypt.compare(
            refreshToken,
            user.refreshToken,
        );
    
        if (isRefreshTokenMatching) {
            return user;
        }else{
            throw new UnauthorizedException('not matching refresh token');
        }
    }
    
    async removeRefreshToken(id: number) {
        return this.userRepository.update(id, {
            refreshToken: null,
        });
    }
    
    async getAccessToken(user:User) {
        try{
            const payload = { customId : user.customId };
            const accessToken = await this.jwtService.sign(payload);
            return accessToken;
        }catch(e){
            throw new UnauthorizedException(e.message);
        }
    }

    async signOut(user:User){
        const userObject = await this.userRepository.findOne({
            where: { customId : user.customId },
        });
        if(userObject){
            await this.removeRefreshToken(userObject.id);
            return {statusCode:"200", contents : "sign out success"};
        }
        else{
            throw new UnauthorizedException('user not found');
        }
    }
}
