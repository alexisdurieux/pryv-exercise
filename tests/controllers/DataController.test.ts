import * as chai from 'chai';
import 'mocha';
import * as request from 'supertest';
import app from '../../src/start';
import * as nock from 'nock';
import { Stream, Event } from '../../src/models';

const meta = {
    apiVersion: 1.1,
    serverTime: 1579450434.133,
    serial: '201906130',
};

const sourceStreams: Stream[] = [
    {
        name: 'A',
        created: 1576492959.356,
        createdBy: 'ck48ave6400c51ed33xxwzz0r',
        modified: 1576492959.356,
        modifiedBy: 'ck48ave6400c51ed33xxwzz0r',
        id: 'a',
        children: [
            {
                name: 'B',
                parentId: 'a',
                created: 1576492959.364,
                createdBy: 'ck48ave6400c51ed33xxwzz0r',
                modified: 1576492959.364,
                modifiedBy: 'ck48ave6400c51ed33xxwzz0r',
                id: 'b',
                children: [],
            },
        ],
    },
];

const backupStreams: Stream[] = [
    {
        name: 'A',
        created: 1576492959.476,
        createdBy: 'ck48ax1gl00c61gd3qnzrxu0j',
        modified: 1576492959.476,
        modifiedBy: 'ck48ax1gl00c61gd3qnzrxu0j',
        id: 'a',
        children: [
            {
                name: 'C',
                parentId: 'a',
                created: 1576492959.483,
                createdBy: 'ck48ax1gl00c61gd3qnzrxu0j',
                modified: 1576492959.483,
                modifiedBy: 'ck48ax1gl00c61gd3qnzrxu0j',
                id: 'c',
                children: [
                    {
                        name: 'D',
                        parentId: 'c',
                        created: 1576493029.928,
                        createdBy: 'ck48ax1gl00c61gd3qnzrxu0j',
                        modified: 1576493029.928,
                        modifiedBy: 'ck48ax1gl00c61gd3qnzrxu0j',
                        id: 'd',
                        children: [],
                      },
                ],
            },
        ],
    },
];

const eventContent = sourceStreams.concat(backupStreams);
// tslint:disable-next-line:no-console
console.log(eventContent);

nock('https://sw-interview-source.pryv.me')
    .persist()
    .get('/streams')
    .reply(200, {
        meta,
        streams: sourceStreams,
    });

nock('https://sw-interview-backup.pryv.me')
    .persist()
    .get('/streams')
    .reply(200, {
        meta,
        streams: backupStreams,
    });

const mockEvent: Event = {
    streamId: 'a',
    type: 'exercice-1/streams',
    content: eventContent,
  };

nock('https://sw-interview-backup.pryv.me')
    .persist()
    .post('/events', JSON.stringify(mockEvent))
    .reply(201, {
        meta,
        event: mockEvent,
    });
// Configure chai
chai.should();

describe('data', () => {
    after((done) => {
        app.close();
        done();
    });
    describe('POST /', () => {
        it('should retrieve the correct event', (done) => {
            request(app).post('/data').send({
                source: {
                    username: 'sw-interview-source',
                    token: 'ck5h1u3o200j21hd39ymop3vj',
                },
                backup: {
                    username: 'sw-interview-backup',
                    token: 'ck5h1b5mw00jf1fd3s6e0vhie',
                },
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, mockEvent, done);
        });

        it('should fail with invalid credentials', (done) => {
            request(app).post('/data').send({
                source: {
                    username: 'sw-interview-source',
                    token: 'ck5h1u3o200j21hd39ymop3vj',
                },
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400, { message: 'Error: Invalid credentials' }, done);
        });
    });
});

