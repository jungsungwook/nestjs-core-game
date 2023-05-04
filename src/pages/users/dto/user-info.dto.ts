export enum UserStatus {
    ONLINE = 'online',
    OFFLINE = 'offline',
    RANDOM_MATCHING = 'random_matching',
    CUSTOM_MATCHING = 'custom_matching',
    MATCHING_SUCCESS = 'matching_success',
}

export class UserInfo {
    status: UserStatus;
}