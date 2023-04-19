import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class AuthCredentialDto {
    @ApiProperty({description: '사용자 아이디', example: 'jswcyber'})
    @IsNotEmpty()
    customId: string;

    @ApiProperty({description: '사용자 이름', example: '정성욱'})
    @IsNotEmpty()
    name: string;

    @ApiProperty({description: '사용자 이메일', example: 'jswcyber@naver.com'})
    @IsNotEmpty()
    email: string;

    @ApiProperty({description: '사용자 비밀번호', example: 'Qlalfqjsgh1234!@'})
    @IsNotEmpty()
    password: string;
}
