import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { EntityManager } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository
  ) {}
  async getUserInfo(user: User) : Promise<{statusCode:string, contents:User}>{
    const userObj =  await this.userRepository.findOne({where:{ customId: user.customId }});
    return {statusCode: '200', contents: userObj};
  }
  async getUser(refreshToken: string, customId: string) : Promise<{statusCode:string, contents:User}>{
    console.log("refreshToken===>", refreshToken)
    console.log("customId===>", customId)
    const userObj =  await this.userRepository.createQueryBuilder("user")
      .select(["user.id", "user.customId", "user.name", "user.email", "user.role", "user.refreshToken", "user.socketId"])
      .where('user.customId = :customId', { customId: customId })
      .getOne();
    console.log("userObj===>", userObj)
    if(!userObj){
      return {statusCode: '404', contents: null};
    }
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      userObj.refreshToken,
    );
    console.log("isRefreshTokenMatching===>", isRefreshTokenMatching)
    if(!isRefreshTokenMatching){
      return {statusCode: '404', contents: null};
    }
    return {statusCode: '200', contents: userObj};
  }
  async socketIdUpdate(user: User, socketId: string) : Promise<{statusCode:string, contents:User}>{
    const userObj =  await this.userRepository.findOne({where:{ customId: user.customId }});
    console.log("del===>", userObj)
    userObj.socketId = socketId;
    await this.userRepository.save(userObj);
    return {statusCode: '200', contents: userObj};
  }
}