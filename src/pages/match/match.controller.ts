import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { MatchService } from "./match.service";
import { AuthGuard } from "@nestjs/passport";
import { GetUser } from "src/auth/get-user.decorator";
import { User } from "../users/user.entity";

@Controller('match')
@ApiTags('매칭')
export class MatchController {
    constructor(private readonly matchService: MatchService) { }

    @Get('random-match-1on1-queue')
    @UseGuards(AuthGuard("jwt"))
    async randomMatch_1on1_queue(
        @GetUser() user: User
    ) {
        try {
            return await this.matchService.randomMatch_1on1_queue(user.customId);
        } catch (e) {
            throw new Error(e);
        }
    }

    @Post('create-custom-match-1on1')
    @UseGuards(AuthGuard("jwt"))
    async createMatch_1on1(
        @GetUser() user: User
    ) {
        try {
            return await this.matchService.createCustomMatch_1on1(user.customId);
        } catch (e) {
            throw new Error(e);
        }

    }

    @Post('join-custom-match-1on1/:matchId')
    @UseGuards(AuthGuard("jwt"))
    async joinMatch_1on1(
        @GetUser() user: User,
        @Param('matchId') matchId: string
    ) {
        try {
            return await this.matchService.joinCustomMatch_1on1(matchId, user.customId);
        } catch (e) {
            throw new Error(e);
        }
    }

    @Get('custom-matches')
    async getCustomMatch(
    ) {
        return await this.matchService.getCustomMatches_1on1();
    }

    @Get('custom-match/:matchId')
    async getCustomMatchById(
        @Param('matchId') matchId: string
    ) {
        try {
            return await this.matchService.getCustomMatch_1on1(matchId);
        } catch (e) {
            throw new Error(e);
        }
    }

    @Get('my-match-progress')
    @UseGuards(AuthGuard("jwt"))
    async getMyMatchProgress(
        @GetUser() user: User
    ) {
        try {
            return await this.matchService.getMyMatchProgress("user.customId");
        } catch (e) {
            throw new Error(e);
        }
    }
}