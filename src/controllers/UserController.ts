import { Request, Response } from 'express';
import { Controller, Post } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import sha1 from 'sha1';
import { UserCreation, UserPublicResource } from 'src/models';
import { UserModel, User } from '../models/User';

@Controller('users')
export class UserController {
    @Post('')
    private async createUser(req: Request, res: Response) {
        try {
            const userCreation: UserCreation = req.body;

            const digest = sha1(userCreation.password);

            await UserModel.createUser(
                userCreation.username,
                digest);

            const user = await UserModel.getUser(userCreation.username, digest);

            Logger.Info(JSON.stringify(user));

            res.status(200).json({
                data: {
                    user: {
                        username: (user as User).username,
                        created_ts: (user as User).created_ts,
                    },
                },
            });
        } catch (error) {
            const message = error.toString();
            Logger.Err(message);
            return res.status(400).json({
                message,
            });
        }
    }
}

