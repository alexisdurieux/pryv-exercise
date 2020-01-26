import * as bodyParser from 'body-parser';
import * as controllers from './controllers';
import { Server } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import { Application } from 'express';
import { sqlite3 } from 'sqlite3';
import { Server as HttpServer } from 'http';

class PryvServer extends Server {

    private readonly SERVER_STARTED = 'PryvServer started on port: ';

    constructor() {
        super(true);
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: true}));
        this.setupControllers();
    }

    private setupControllers(): void {
        const ctlrInstances = [];
        for (const name in controllers) {
            if (controllers.hasOwnProperty(name)) {
                const controller = (controllers as any)[name];
                ctlrInstances.push(new controller());
            }
        }
        super.addControllers(ctlrInstances);
    }

    public start(port: number): HttpServer {
        this.app.get('*', (req, res) => {
            res.send(this.SERVER_STARTED + port);
        });
        const server = this.app.listen(port, () => {
            Logger.Imp(this.SERVER_STARTED + port);
        });
        return server;
    }
}

export default PryvServer;
