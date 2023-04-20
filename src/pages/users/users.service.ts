import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { EntityManager } from 'typeorm';

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
  async getUser(refreshToken: string, customId: string, queryRunnerManager: EntityManager) : Promise<{statusCode:string, contents:User}>{
    const userObj =  await queryRunnerManager.findOne(User, {
      where:{ refreshToken: refreshToken, customId: customId}
    });
    console.log(refreshToken)
    if(!userObj){
      return {statusCode: '404', contents: null};
    }
    return {statusCode: '200', contents: userObj};
  }
  async socketIdUpdate(user: User, socketId: string, queryRunnerManager: EntityManager) : Promise<{statusCode:string, contents:User}>{
    const userObj =  await queryRunnerManager.findOne(User, {where:{ customId: user.customId }});
    userObj.socketId = socketId;
    await queryRunnerManager.save(userObj);
    return {statusCode: '200', contents: userObj};
  }
}