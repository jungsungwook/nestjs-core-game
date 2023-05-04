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
    RANDOM_MATCH_2ON2 = "random_match_2on2",
    CUSTOM_MATCH_1ON1 = "custom_match_1on1",
}

export enum MatchStatus {
    MATCH_CHANGE = "match_change",
    MATCH_START = "match_start",
    MATCH_SUCCESS = "match_success",
    MATCH_CANCEL = "match_cancel"
}