import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './user.entity';
import { GetUser } from 'src/auth/get-user.decorator';
import { ApiTags } from '@nestjs/swagger';

@Controller('users')
@ApiTags('회원 정보')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard("jwt"))
  getUserInfo(@GetUser() user:User) : Promise<{statusCode:string, contents:User}> {
    return this.usersService.getUserInfo(user);
  }
}