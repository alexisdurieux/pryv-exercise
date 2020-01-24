import { Request, Response } from 'express';
import { Controller, Post } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import {
    DuplicationCredentials,
    StreamsResponse,
    Event,
    EventResponse,
    Stream,
} from '../models';
import { Service } from '../services/IService';
// import { _ } from 'lodash';

@Controller('data')
export class DataController {
    @Post('')
    private async replicateStream(req: Request, res: Response) {
        /*
        To improve ideas:
            - Make stronger validation and error handling with a library such as joi js
        */
        try {
            const credentials: DuplicationCredentials = req.body;

            if (!credentials.backup || !credentials.source) {
                throw new Error('Invalid credentials');
            }

            Logger.Info(JSON.stringify(credentials));

            const sourceService = new Service(credentials.source);
            const backupService = new Service(credentials.backup);

            const streamsPromises = await Promise.all(
                [
                    sourceService.get<StreamsResponse>('streams', {}),
                    backupService.get<StreamsResponse>('streams', {}),
                ],
            );

            const sourceStreams = streamsPromises[0] as StreamsResponse;
            const backupStreams = streamsPromises[1] as StreamsResponse;

            if (backupStreams.streams.length === 0) {
                throw new Error(
                    'No backup streams. Impossible to create an event without a stream',
                );
            }

            const newEvent: Event = {
                streamId: backupStreams.streams[0].id,
                type: 'exercice-1/streams',
                content: sourceStreams.streams.concat(backupStreams.streams),
            };

            Logger.Info(JSON.stringify(newEvent));

            const eventResponse = await backupService.post<EventResponse>('events', newEvent);
            return res.status(200).json(eventResponse);
        } catch (error) {
            const message = error.toString();
            Logger.Err(message);
            return res.status(400).json({
                message,
            });
        }
    }

    @Post('intersection')
    private async streamIntersection(req: Request, res: Response) {
        try {
            const credentials: DuplicationCredentials = req.body;

            if (!credentials.backup || !credentials.source) {
                throw new Error('Invalid credentials');
            }

            const sourceService = new Service(credentials.source);
            const backupService = new Service(credentials.backup);

            const streamsPromises = await Promise.all(
                [
                    sourceService.get<StreamsResponse>('streams', {}),
                    backupService.get<StreamsResponse>('streams', {}),
                ],
            );

            const sourceStreams = streamsPromises[0] as StreamsResponse;
            const backupStreams = streamsPromises[1] as StreamsResponse;

            const newEvent: Event = {
                streamId: backupStreams.streams[0].id,
                type: 'exercice/intersection',
                content: this.intersection(sourceStreams.streams, backupStreams.streams),
            };

            Logger.Info(JSON.stringify(newEvent));

            const eventResponse = await backupService.post<EventResponse>('events', newEvent);
            return res.status(200).json(eventResponse);
        } catch (error) {
            const message = error.toString();
            Logger.Err(message);
            return res.status(400).json({
                message,
            });
        }

    }

    private intersection(streams1: Stream[], streams2: Stream[]): Stream[] {
        const intersections: Stream[] = [];
        streams1.forEach((stream1: Stream) => {
            streams2.forEach((stream2: Stream) => {
                if (stream1.id === stream2.id) {
                    const cpy = JSON.parse(JSON.stringify(stream1));
                    cpy.children = [];
                    intersections.push(stream1);
                }
            });
        });
        intersections.forEach((stream1: Stream) => {
            const stream2 = streams2.find((s) => s.id === stream1.id);
            stream1.children = this.intersection(stream1.children, (stream2 as Stream).children);
        });

        return intersections;
    }

}
