import request from 'supertest';

import {describe, it} from 'mocha';
import {app, server} from "../../server/server";

describe('server', () => {
    it('index', async () => {
        await request(app).get('/').expect(200);
    });

    it('case-map', async () => {
        await request(app).get('/case-map').expect(200);
    })

    it('about', (done) => {
        request(app).get('/about').expect(200,done);
    })

    it('containment', async () => {
        await request(app).get('/containment').expect(200);
    })

    it('request-calculation', async () => {
        await request(app).get('/request-calculation').expect(200);
    })

    it('status', async () => {
        await request(app).get('/status').expect(200);
    })

    after(done => {
        server.close(done);
    })
})