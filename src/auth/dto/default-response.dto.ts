import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class DefaultResponseDto {
    @ApiProperty({description: '응답 코드', example: '2xx'})
    @IsNotEmpty()
    statusCode: string;

    @ApiProperty({description: '응답 내용', example: ''})
    @IsNotEmpty()
    contents: any;
}
