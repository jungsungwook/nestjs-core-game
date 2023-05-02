export class MatchDto {
    match_id: string;
    match_type: string;
    match_status: string;
    match_start_time: Date;
    match_end_time?: Date;
    match_rank_score?: number;
    join_user: string[];
}

export enum MatchType {
    RANDOM_MATCH_1ON1 = "random_match_1on1",
    RANDOM_MATCH_2ON2 = "random_match_2on2"
}