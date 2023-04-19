import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

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
    const userObj =  await this.userRepository.findOne({
      where:{ refreshToken: refreshToken }
    });
    if(!userObj){
      return {statusCode: '404', contents: null};
    }
    return {statusCode: '200', contents: userObj};
  }
  async socketIdUpdate(user: User, socketId: string) : Promise<{statusCode:string, contents:User}>{
    const userObj =  await this.userRepository.findOne({where:{ customId: user.customId }});
    userObj.socketId = socketId;
    await this.userRepository.save(userObj);
    return {statusCode: '200', contents: userObj};
  }
}