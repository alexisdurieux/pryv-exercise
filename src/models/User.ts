import Database from '../Database';

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

export class UserModel {
    public static async getUser(
        username: string,
        passwordDigest: string): Promise<User | undefined> {
        return await Database.getInstanceDb()
            .select('*')
            .from<User>('users')
            .where('username', username)
            .where('password_digest', passwordDigest)
            .first();
    }

    public static async createUser(
        username: string,
        passwordDigest: string): Promise<User> {
            return await Database.getInstanceDb()
                .from<User>('users')
                .insert( { username, password_digest: passwordDigest} );
        }
}
