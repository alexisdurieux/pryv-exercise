import * as sqlite3 from 'sqlite3';
import knex from 'knex';
import { UserPublicResource, User } from './models';

class Database {
    public static db = knex({
        client: 'sqlite3',
        connection: { filename: process.env.DB ? process.env.DB : ':memory:' },
    });

    public static getInstanceDb = () => Database.db;
}

export default Database;
