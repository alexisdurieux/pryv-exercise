import * as chai from 'chai';
import 'mocha';
import app from '../../src/start';
import request from 'supertest';
import Database from '../../src/Database';
import { assert } from 'chai';
import { Resource } from '../../src/models/Resource';

chai.should();

async function setupDb() {
    await Database.run('CREATE TABLE users(username VARCHAR(50) PRIMARY KEY,password_digest VARCHAR(40) NOT NULL,created_ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,token VARCHAR(40),token_created_ts TIMESTAMP)', {});
    await Database.run('CREATE table tokens(value VARCHAR(40) NOT NULL PRIMARY KEY,created_ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP)', {});
    await Database.run('CREATE TABLE resources(id VARCHAR(40) PRIMARY KEY,data TEXT,created_ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,modified_ts TIMESTAMP,deleted_ts TIMESTAMP)', {});
}

let token: string;

describe('resource', () => {
    before(async () => {
        await setupDb();
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
            token = response.body.data.token;
        });
    });
    after(async () => {
        await Database.run('DROP Table resources', {});
        await Database.run('DROP Table tokens', {});
        await Database.run('DROP Table users', {});

        app.close();
    });
    describe('POST /resources', () => {
        let resource: Resource;
        it('create resource', async () => {
            await request(app)
                .post('/resources')
                .set('authorization', token)
                .send({
                    data: {
                        hey: 'you',
                        comfortably: 'numb',
                    },
                })
                .expect('Content-Type', 'application/json; charset=utf-8')
                .then((response) => {
                    resource = response.body.data;
                    // tslint:disable-next-line:max-line-length
                    assert(JSON.stringify(response.body.data.data) === JSON.stringify({ hey: 'you', comfortably: 'numb'}), 'create test');
                });
        });

        it('get resource by id', (done) => {
            request(app)
                .get(`/resources/${resource.id}`)
                .set('authorization', token)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(200, { status: 200, data: resource }, done);
        });

        it('update resource', async () => {
            await request(app)
                .put(`/resources/${resource.id}`)
                .set('authorization', token)
                .send({
                    data: {
                        hey: '2',
                        comfortably: 3,
                    },
                })
                .expect('Content-Type', 'application/json; charset=utf-8')
                .then((response) => {
                    resource = response.body.data;
                    // tslint:disable-next-line:max-line-length
                    assert(JSON.stringify(response.body.data.data) === JSON.stringify({ hey: '2', comfortably: 3}), 'update test');
                });
        });

        it('delete resource', async () => {
            await request(app)
                .delete(`/resources/${resource.id}`)
                .set('authorization', token)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .then((response) => {
                    resource = response.body.data;
                    // tslint:disable-next-line:max-line-length
                    assert(response.body.data.data === null, 'delete test');
                });
        });
    });
});
