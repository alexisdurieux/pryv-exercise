import * as sqlite3 from 'sqlite3';
import knex from 'knex';
import { UserPublicResource, User } from './models';

class Database {
    private static instance = new sqlite3.Database(process.env.DB ? process.env.DB : ':memory:');
    public static getInstance = () => Database.instance;

    public static k = knex({
        client: 'sqlite3',
        connection: { filename: process.env.DB ? process.env.DB : ':memory:' },
    });

    public static async run(q: string, params: any) {
        return new Promise((resolve, reject) => {
            Database.instance.run(q, params, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public static async get<T>(q: string, params: any): Promise<T | undefined> {
        return new Promise((resolve, reject) => {
            Database.instance.get(q, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    public static async all<T>(q: string, params: any): Promise<T[] | undefined> {
        return new Promise((resolve, reject) => {
            Database.instance.all(q, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    public static async getUser(
        username: string,
        passwordDigest: string):
            Promise<User | undefined> {
                // tslint:disable-next-line:no-console
                console.log(this.k.select('*')
                .from<User>('users')
                .where('username', username)
                .where('password_digest', passwordDigest).toSQL());

                return await this.k.select('*')
                    .from<User>('users')
                    .where('username', username)
                    .where('password_digest', passwordDigest)
                    .first();
    }
}

export default Database;
