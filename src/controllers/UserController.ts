import { Request, Response } from 'express';
import { Controller, Post } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import Database from '../Database';
import sha1 from 'sha1';
import { UserCreation, UserPublicResource, User } from 'src/models';

@Controller('users')
export class UserController {
    @Post('')
    private async createUser(req: Request, res: Response) {
        try {
            const userCreation: UserCreation = req.body;

            await Database.run('INSERT INTO users (username, password_digest) VALUES ($username, $password_digest)', {
                $username: userCreation.username,
                $password_digest: sha1(userCreation.password),
            });

            const user = await Database.getUser(
                userCreation.username,
                sha1(userCreation.password));

            res.status(200).json({
                data: {
                    user: {
                        username: (user as UserPublicResource).username,
                        created_ts: (user as UserPublicResource).created_ts,
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

