import Database from '../Database';
import { Logger } from '@overnightjs/logger';
import moment from 'moment';

export interface Token {
    value: string;
    created_ts: number;
}

export class TokenModel {
    public static async createToken(token: string): Promise<Token> {
        return await Database.getInstanceDb().from<Token>('tokens').insert({ value: token});
    }

    public static async getToken(token: string): Promise<Token | undefined> {
        const nowMinus2days = moment(new Date()).subtract(1, 'days').toISOString();

        return await Database
            .getInstanceDb()
            .from<Token>('tokens')
            .select('*')
            .where('value', token)
            .where('created_ts', '>=', nowMinus2days)
            .first();
    }
}

