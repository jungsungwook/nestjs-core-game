import { DataSource, Repository } from "typeorm";
import { User } from "./user.entity";
import * as bcrypt from 'bcryptjs';
import { ConflictException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { AuthCredentialDto } from "src/auth/dto/auth-credential.dto";


@Injectable()
export class UserRepository extends Repository<User>{
    constructor(private dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }
    async createUser(authCredentialDto: AuthCredentialDto): Promise<User> {
        const { customId, name, email, password } = authCredentialDto;

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = this.create({
            customId,
            name,
            email,
            password : hashedPassword
        })
        try{
            await this.save(user);
            return user;
        }
        catch(error){
            if(error.code === '23505'){
                throw new ConflictException('User already exists');
            }
            else{
                console.log(error);
                throw new InternalServerErrorException();
            }
        }
    }
}