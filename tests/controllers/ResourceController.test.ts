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
    let resource: Resource;
    describe('POST /resources', () => {
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
                    assert(JSON.stringify(response.body.resource.data) === JSON.stringify({ hey: 'you', comfortably: 'numb'}), 'create resource');
                });
        });

        it('create resource with existing id should fail', async () => {
            await request(app)
                .post('/resources')
                .set('authorization', token)
                .send({
                    data: {
                        hey: 'you',
                        comfortably: 'numb',
                    },
                    id: resource.id,
                })
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(400);
        });
    });

    describe('GET /resources/:id', () => {
        it('get resource by id work', async () => {
            await request(app)
                .get(`/resources/${resource.id}`)
                .set('authorization', token)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(200, { status: 200, resource });
        });

        it('get resource with invalid id should return a 404', async () => {
            await request(app)
                .get(`/resources/invalid_id`)
                .set('authorization', token)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(404, { message: 'Entity Not found'});
        });
    });

    describe('GET /resources', () => {
        it('get all resources should work', async () => {
            await request(app)
                .get(`/resources`)
                .set('authorization', token)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(200, { status: 200, resources: [resource] });
        });

        it('get all resources with an invalid token shouldn\'t work', async () => {
            await request(app)
                .get(`/resources`)
                .set('authorization', 'invalid token')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(401, { message: 'Invalid access token'});
        });
    });

    describe('UPDATE /resources/:id', () => {
        it('update a resource id should work', async () => {
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
                        'update resource test');
                });
        });

        it('undefined data field should return an error', async () => {
            await request(app)
                .put(`/resources/${resource.id}`)
                .set('authorization', token)
                .send({
                    data: null,
                })
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(400, { status: 400, message: 'Bad input data. Data is undefined or too many fields or non string/integer values'});
        });
    });

    describe('DELETE /resources/:id', () => {
        it('delete a resource with an unknown id should return a 404', async () => {
            await request(app)
                .delete(`/resources/invalid id`)
                .set('authorization', token)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(404, { message: 'Entity Not found'});
        });

        it('delete a resource should set data to null', async () => {
            await request(app)
                .delete(`/resources/${resource.id}`)
                .set('authorization', token)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(200, { status: 200 });
        });
    });
});
