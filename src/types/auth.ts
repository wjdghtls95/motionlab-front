export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    nickname: string;
}

export interface LoginResponse {
    accessToken: string;
    user: UserInfo;
}

export interface UserInfo {
    id: number;
    email: string;
    nickname: string;
}