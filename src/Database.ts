import * as sqlite3 from 'sqlite3';

class Database {
    private static instance = new sqlite3.Database(process.env.DB ? process.env.DB : ':memory:');
    public static getInstance = () => Database.instance;

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
}

export default Database;
