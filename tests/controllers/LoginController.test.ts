import * as chai from 'chai';
import 'mocha';
import app from '../../src/start';
import request from 'supertest';
import Database from '../../src/Database';
import { assert } from 'chai';

chai.should();

describe('auth', () => {
    before(async () => {
        await Database.getInstanceDb().schema.createTable('users', (table) => {
            table.string('username', 50).primary();
            table.string('password_digest', 40).notNullable();
            table.timestamp('created_ts').notNullable().defaultTo(Database.db.fn.now());
        });

        await Database.getInstanceDb().schema.createTable('tokens', (table) => {
            table.string('value', 40).primary();
            table.timestamp('created_ts').notNullable().defaultTo(Database.db.fn.now());
        });

        await request(app).post('/users').send({
            username: 'alexis',
            password: 'thisisapassword',
        });
    });
    after(async () => {
        await Database.getInstanceDb().schema.dropTable('tokens');
        await Database.getInstanceDb().schema.dropTable('users');

        app.close();
    });
    describe('POST /auth/login', () => {
        it('should not login correctly if wrong password', (done) => {
            request(app).post('/auth/login').send({
                username: 'alexis',
                password: 'toto',
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400, { message: 'Entity Not found' }, done);
        });

        it('should return a token if login is ok', async () => {
            await request(app).post('/auth/login').send({
                username: 'alexis',
                password: 'thisisapassword',
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then((response) => {
                assert(!!response.body.data.token);
            });
        });
    });
});
