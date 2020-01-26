import { Request, Response } from 'express';
import { Controller, Post } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import { LoginResource } from 'src/models/LoginResource';
import Database from '../Database';
import sha1 from 'sha1';
import cuid from 'cuid';
import { UserPublicResource, User } from 'src/models';

@Controller('auth')
export class LoginController {
    @Post('login')
    private async login(req: Request, res: Response) {
        try {
            const loginResource: LoginResource = req.body;

            const user = await Database.get<UserPublicResource>('SELECT * from users where username = $username AND password_digest= $password_digest', {
                $username : loginResource.username,
                $password_digest: sha1(loginResource.password),
            });

            if (!user) {
                res.status(400).json({
                    message: 'User not found',
                });
            }

            const newToken = cuid();

            await Database.run('INSERT INTO tokens (value) VALUES ($token)', {
                $token: newToken,
            });

            res.status(200).json({
                data: {
                    token: newToken,
                },
                status: 200,
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

