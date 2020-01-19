export interface Credentials {
    username: string;
    token: string;
}

export interface DuplicationCredentials {
    source: Credentials;
    backup: Credentials;
}
