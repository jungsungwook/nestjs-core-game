import { Controller, Get, UseGuards } from "@nestjs/common";
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
        @GetUser() user:User
    ) {
        return await this.matchService.randomMatch_1on1_queue(user.customId);
    }
}