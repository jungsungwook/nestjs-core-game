import { ApiProperty } from "@nestjs/swagger";

export class MatchDto {
    @ApiProperty({
        description: '매치 ID',
        example: '1234567890',
    })
    match_id: string;

    @ApiProperty({
        description: '매치 타입',
        example: 'random_match_1on1',
    })
    match_type: string;

    @ApiProperty({
        description: '매치 상태',
        example: 'match_change',
    })
    match_status: string;

    @ApiProperty({
        description: '매치 생성 시간',
        example: '2021-01-01T00:00:00.000Z',
    })
    match_start_time: Date;

    @ApiProperty({
        description: '매치 종료 시간',
        example: '2021-01-01T00:00:00.000Z',
    })
    match_end_time?: Date;

    @ApiProperty({
        description: '매치 랭크 점수',
        example: 1000,
    })
    match_rank_score?: number;

    @ApiProperty({
        description: '매치 참가 유저',
        example: ['jswcyber', 'abc123'],
    })
    join_user: string[];
}

export class DefaultResponseMatchDto {
    @ApiProperty({
        description: '응답 코드',
        example: 200,
    })
    statusCode: number;

    @ApiProperty({
        description: '전달 데이터'
    })
    contents: MatchDto;
}

export enum MatchType {
    RANDOM_MATCH_1ON1 = "random_match_1on1",
    RANDOM_MATCH_2ON2 = "random_match_2on2",
    CUSTOM_MATCH_1ON1 = "custom_match_1on1",
}

export enum MatchStatus {
    MATCH_CHANGE = "match_change",
    MATCH_START = "match_start",
    MATCH_SUCCESS = "match_success",
    MATCH_CANCEL = "match_cancel",
    MATCH_CREATE = "match_create",
    MATCH_JOIN = "match_join",
}