import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { EntityManager } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

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

  async getUser(refreshToken: string) : Promise<{statusCode:string, contents:User}>{
    const userId = await jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET, (err, decoded) => {
      if(err){
        return null;
      }
      return decoded['id'];
    });

    if(userId == null){
      return {statusCode: '404', contents: null};
    }

    const userObj =  await this.userRepository.createQueryBuilder("user")
      .select(["user.id", "user.customId", "user.name", "user.email", "user.role", "user.refreshToken", "user.socketId"])
      .where('user.id = :id', { id: userId })
      .getOne();

    return {statusCode: '200', contents: userObj};
  }

  async socketIdUpdate(user: User, socketId: string) : Promise<{statusCode:string, contents:User}>{
    const userObj =  await this.userRepository.findOne({where:{ customId: user.customId }});
    userObj.socketId = socketId;
    userObj.updatedAt = new Date();
    await this.userRepository.save(userObj);
    return {statusCode: '200', contents: userObj};
  }

  async disconnectSocketId(socketId: string) : Promise<{statusCode:string, contents:User}>{
    const userObj =  await this.userRepository.findOne({where:{ socketId: socketId }});
    userObj.socketId = null;
    userObj.exitAt = new Date();
    await this.userRepository.save(userObj);
    return {statusCode: '200', contents: userObj};
  }
}