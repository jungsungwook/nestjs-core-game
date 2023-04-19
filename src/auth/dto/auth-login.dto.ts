import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class AuthLoginDto {
    @ApiProperty({description: '사용자 아이디', example: 'jswcyber'})
    @IsNotEmpty()
    customId: string;

    @ApiProperty({description: '사용자 비밀번호', example: 'Qlalfqjsgh1234!@'})
    @IsNotEmpty()
    password: string;
}
