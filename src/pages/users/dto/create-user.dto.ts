import { IsNotEmpty } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    customId: string;
    @IsNotEmpty()
    name: string;
    @IsNotEmpty()
    email: string;
    @IsNotEmpty()
    password: string;
}
