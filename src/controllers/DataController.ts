import { Request, Response } from 'express';
import { Controller, Post } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import {
    DuplicationCredentials,
    StreamsResponse,
    Event,
    EventResponse,
} from '../models';
import { Service } from '../services/IService';

@Controller('data')
export class DataController {
    @Post('')
    private async replicateStream(req: Request, res: Response) {
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

}
