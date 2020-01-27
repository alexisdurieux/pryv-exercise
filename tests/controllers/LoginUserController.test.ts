import * as chai from 'chai';
import 'mocha';
import app from '../../src/start';
import request from 'supertest';
import Database from '../../src/Database';
import { assert } from 'chai';

chai.should();

async function setupDb() {
    await Database.run('CREATE TABLE users(username VARCHAR(50) PRIMARY KEY,password_digest VARCHAR(40) NOT NULL,created_ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,token VARCHAR(40),token_created_ts TIMESTAMP)', {});
    await Database.run('CREATE table tokens(value VARCHAR(40) NOT NULL PRIMARY KEY,created_ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP)', {});
}

describe('auth', () => {
    before(async () => {
        await setupDb();
    });
    after((done) => {
        app.close();
        done();
    });
    describe('POST /login', () => {
        it('should not login correctly if no account', (done) => {
            request(app).post('/auth/login').send({
                username: 'alexis',
                password: 'toto',
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400, { message: 'User not found' }, done);
        });

        it('should return a token if an account exists', async () => {
            await request(app).post('/users').send({
                username: 'alexis',
                password: 'toto',
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200);

            await request(app).post('/auth/login').send({
                username: 'alexis',
                password: 'toto',
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then((response) => {
                assert(!!response.body.data.token);
            });
        });
    });
});
