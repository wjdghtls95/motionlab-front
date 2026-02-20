export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

// 백엔드 로그인 응답 (flat 구조)
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    userId: number;
    email: string;
    name: string;
}

export interface UserInfo {
    id: number;
    email: string;
    name: string;
}