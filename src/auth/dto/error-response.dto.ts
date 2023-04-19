import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class ErrorResponseDto {
    @ApiProperty({description: '응답 코드', example: '4xx'})
    @IsNotEmpty()
    statusCode: string;

    @ApiProperty({description: '에러 전달', example: ''})
    @IsNotEmpty()
    contents: any;
}
