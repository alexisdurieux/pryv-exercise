export interface UserCreation {
    username: string;
    password: string;
}

export interface UserPublicResource {
    username: string;
    created_ts: number;
}

export interface User {
    username: string;
    password_digest: string;
    created_ts: number;
}
