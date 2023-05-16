import { Body, Controller, Get, HttpException, Param, Post, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { MatchService } from "./match.service";
import { AuthGuard } from "@nestjs/passport";
import { GetUser } from "src/auth/get-user.decorator";
import { User } from "../users/user.entity";
import { DefaultResponseMatchDto, MatchCreateDto, MatchDto, MatchJoinDto } from "./dto/match.dto";

@Controller('match')
@ApiTags('매칭')
export class MatchController {
    constructor(private readonly matchService: MatchService) { }

    @Get('random-match-1on1-queue')
    @ApiOperation({
        summary: '랜덤 매칭 1:1 대기열',
        description: '랜덤 매칭 1:1 대기열에 참가합니다.'
    })
    @ApiResponse({
        description: '랜덤 매칭 1:1 대기열 참가 성공',
        type: DefaultResponseMatchDto,
        status: 200
    })
    @UseGuards(AuthGuard("jwt"))
    async randomMatch_1on1_queue(
        @GetUser() user: User
    ): Promise<DefaultResponseMatchDto> {
        try {
            const result = await this.matchService.randomMatch_1on1_queue(user.customId);
            return {
                statusCode: 200,
                contents: result
            }
        } catch (e) {
            throw new HttpException(e.message, e.status);
        }
    }

    @Post('create-custom-match')
    @ApiOperation({
        summary: '커스텀 매칭생성',
        description: '커스텀 매칭을 생성합니다.'
    })
    @ApiResponse({
        description: '커스텀 매칭 생성 성공',
        type: DefaultResponseMatchDto,
        status: 200
    })
    @UseGuards(AuthGuard("jwt"))
    async createMatch_1on1(
        @GetUser() user: User,
        @Body() body:MatchCreateDto
    ): Promise<DefaultResponseMatchDto> {
        try {
            const result = await this.matchService.createCustomMatch(user.customId, body);
            return {
                statusCode: 200,
                contents: result
            }
        } catch (e) {
            throw new HttpException(e.message, e.status);
        }

    }

    @Post('join-custom-match')
    @ApiOperation({
        summary: '커스텀 매칭 참가',
        description: '커스텀 매칭에 참가합니다.'
    })
    @ApiResponse({
        description: '커스텀 매칭 참가 성공',
        type: DefaultResponseMatchDto,
        status: 200
    })
    @UseGuards(AuthGuard("jwt"))
    async joinMatch_1on1(
        @GetUser() user: User,
        @Body() body: MatchJoinDto
    ): Promise<DefaultResponseMatchDto> {
        try {
            const result = await this.matchService.joinCustomMatch(body, user.customId);
            return {
                statusCode: 200,
                contents: result
            }
        } catch (e) {
            throw new HttpException(e.message, e.status);
        }
    }

    @Get('custom-matches')
    @ApiOperation({
        summary: '커스텀 매칭 1:1 목록',
        description: '커스텀 매칭 1:1 목록을 가져옵니다.'
    })
    async getCustomMatch(
    ) {
        try {
            const result = await this.matchService.getCustomMatches();
            return {
                statusCode: 200,
                contents: result
            }
        } catch (e) {
            throw new Error(e);
        }
    }

    @Get('custom-match/:matchId')
    @ApiOperation({
        summary: '커스텀 매칭 1:1 정보',
        description: '커스텀 매칭 1:1 정보를 가져옵니다.'
    })
    async getCustomMatchById(
        @Param('matchId') matchId: string
    ): Promise<DefaultResponseMatchDto> {
        try {
            const result = await this.matchService.getCustomMatch(matchId);
            return {
                statusCode: 200,
                contents: result
            }
        } catch (e) {
            throw new HttpException(e.message, e.status);
        }
    }

    @Get('my-match-progress')
    @ApiOperation({
        summary: '내 매칭 진행 상황',
        description: '내 매칭 진행 상황을 가져옵니다.'
    })
    @ApiResponse({
        description: '내 매칭 진행 상황 가져오기 성공',
        type: DefaultResponseMatchDto,
        status: 200
    })
    @UseGuards(AuthGuard("jwt"))
    async getMyMatchProgress(
        @GetUser() user: User
    ): Promise<DefaultResponseMatchDto> {
        try {
            const result = await this.matchService.getMyMatchProgress(user.customId);
            return {
                statusCode: 200,
                contents: result
            }
        } catch (e) {
            throw new HttpException(e.message, e.status);
        }
    }
}