import * as chai from 'chai';
import 'mocha';
import app from '../../src/start';
import request from 'supertest';
import Database from '../../src/Database';
import { assert } from 'chai';
import { Resource } from '../../src/models/Resource';

chai.should();

let token: string;

describe('resource', () => {
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

        await Database.getInstanceDb().schema.createTable('resources', (table) => {
            table.string('id', 40).primary();
            table.text('data');
            table.timestamp('created_ts').notNullable().defaultTo(Database.db.fn.now());
            table.timestamp('modified_ts');
            table.timestamp('deleted_ts');
        });

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
        await Database.getInstanceDb().schema.dropTable('tokens');
        await Database.getInstanceDb().schema.dropTable('users');
        await Database.getInstanceDb().schema.dropTable('resources');

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
                    resource = response.body.resource;
                    // tslint:disable-next-line:max-line-length
                    assert(JSON.stringify(response.body.resource.data) === JSON.stringify({ hey: 'you', comfortably: 'numb'}), 'create test');
                });
        });

        it('get resource by id', (done) => {
            request(app)
                .get(`/resources/${resource.id}`)
                .set('authorization', token)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(200, { status: 200, resource }, done);
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
                    resource = response.body.resource;
                    assert(
                        JSON.stringify(response.body.resource.data) ===
                        JSON.stringify({ hey: '2', comfortably: 3}),
                        'update test');
                });
        });

        it('delete resource', async () => {
            await request(app)
                .delete(`/resources/${resource.id}`)
                .set('authorization', token)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .then((response) => {
                    resource = response.body.data;
                    assert(JSON.stringify(response.body) === JSON.stringify({ status: 200 }), 'delete test');
                });
        });
    });
});
