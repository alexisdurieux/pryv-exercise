import { Request, Response } from 'express';
import { Controller, Post, Get, Delete, Put } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import { LoginResource } from 'src/models/LoginResource';
import Database from '../Database';
import sha1 from 'sha1';
import cuid from 'cuid';
import { UserPublicResource, Dictionary } from 'src/models';
import { json } from 'body-parser';
import { Token } from 'src/models/Token';
import { Resource } from 'src/models/Resource';
import { isNumber, isString } from 'util';
import { request } from 'http';

@Controller('resources')
export class ResourceController {

    // Do it with middleware
    private async checkAuthorization(authorization: string | undefined): Promise<boolean> {
        if (!authorization) {
            return false;
        } else {
            const token = await Database.get<Token>('SELECT * from tokens where value = $token and created_ts >= Datetime(\'now\', \'-2 days\')', {
                $token: authorization,
            });

            return !!token;
        }
    }

    private checkResourceData(data: Dictionary<number | string> | undefined): boolean {
        if (!data) {
            return true;
        }
        return (Object.keys(data).length <= 10 && Object.values(data).map((v) => {
            return isNumber(v) || isString(v);
        }).reduce((a, b) => a && b));
    }

    @Get(':id')
    private async get(req: Request, res: Response) {
        try {
            const authorized = await this.checkAuthorization(req.headers.authorization);

            if (!authorized) {
                res.status(401).json({
                    message: 'User is not allowed to perform this action',
                });
            }

            const resource = await Database.get<Resource>(
                'SELECT * from resources WHERE id = $id',
                { $id: req.params.id },
            );

            if (!resource) {
                res.status(404).json({
                    message: 'Resource not found',
                });
            } else {
                res.status(200).json({
                    status: 200,
                    data: {
                        id: resource.id as string,
                        data: resource.data ?
                            JSON.parse(resource.data as string) :
                            null,
                        created_ts: resource.created_ts,
                        modified_ts: resource.modified_ts,
                        deleted_ts: resource.deleted_ts,
                    },
                });
            }
        } catch (error) {
            const message = error.toString();
            Logger.Err(message);
            return res.status(400).json({
                message,
            });
        }
    }

    @Get('')
    private async getAll(req: Request, res: Response) {
        try {
            const authorized = await this.checkAuthorization(req.headers.authorization);

            if (!authorized) {
                res.status(401).json({
                    status: 401,
                    message: 'User is not allowed to perform this action',
                });
            }

            // Warning. This should be paginated. Ok for the scope of the exercise
            const results = await Database.all<Resource>(
                'SELECT * from resources', {},
            );

            res.status(200).json({
                status: 200,
                data: (results as Resource[]).map((resource) => {
                    return {
                        id: resource.id as string,
                        data: resource.data ?
                            JSON.parse(resource.data as string) :
                            null,
                        created_ts: resource.created_ts,
                        modified_ts: resource.modified_ts,
                        deleted_ts: resource.deleted_ts,
                    };
                }),
            });
        } catch (error) {
            const message = error.toString();
            Logger.Err(message);
            return res.status(400).json({
                message,
            });
        }
    }

    @Post('')
    private async createResource(req: Request, res: Response) {
        try {
            const authorized = await this.checkAuthorization(req.headers.authorization);

            if (!authorized) {
                res.status(401).json({
                    status: 401,
                    message: 'User is not allowed to perform this action',
                });
            }

            const newResource = req.body as Resource;
            const now = new Date();
            const id = newResource.id ? newResource.id : cuid();

            if (this.checkResourceData(
                newResource.data as Dictionary<string | number> | undefined)
                ) {
                await Database.run(
                    'INSERT INTO resources (id, data, created_ts, modified_ts) VALUES ($id, $data, $created_ts, $modified_ts)',
                    {
                        $id: id,
                        $data: JSON.stringify(newResource.data),
                        $created_ts: now,
                        $modified_ts: now,
                    },
                );

                const createdResource = await Database.get<Resource>(
                    'SELECT * from resources WHERE id = $id',
                    { $id: id },
                );

                const r = createdResource as Resource;

                res.status(200).json({
                    status: 200,
                    data: {
                        id: r.id as string,
                        data: r.data ?
                            JSON.parse(r.data as string) :
                            null,
                        created_ts: r.created_ts,
                        modified_ts: r.modified_ts,
                        deleted_ts: r.deleted_ts,
                    },
                });
            } else {
                res.status(400).json({
                    status: 400,
                    message: 'Bad input data. Too many fields or non string/integer values',
                });
            }
        } catch (error) {
            const message = error.toString();
            Logger.Err(message);
            return res.status(400).json({
                message,
            });
        }
    }

    @Put(':id')
    private async updateResource(req: Request, res: Response) {
        try {
            const authorized = await this.checkAuthorization(req.headers.authorization);

            if (!authorized) {
                res.status(401).json({
                    status: 401,
                    message: 'User is not allowed to perform this action',
                });
            }

            const updateData = (req.body as Resource);

            const resource = await Database.get<Resource>(
                'SELECT * from resources WHERE id = $id',
                { $id: req.params.id },
            );

            if (!resource) {
                res.status(404).json({
                    status: 404,
                    message: `No resource with id ${req.params.id} was found`,
                });
            }

            if ((resource as Resource).deleted_ts) {
                res.status(400).json({
                    status: 404,
                    message: `Can't update deleted resource`,
                });
            }

            if (this.checkResourceData(
                updateData.data as Dictionary<string | number> | undefined)
                ) {
                const now = new Date();
                await Database.run(
                    'UPDATE resources SET data = $data, modified_ts=$modified_ts WHERE id=$id',
                    {
                        $data: JSON.stringify(updateData.data),
                        $modified_ts: now,
                        $id: req.params.id,
                    },
                );

                const updatedResource = await Database.get<Resource>(
                    'SELECT * from resources WHERE id = $id',
                    { $id: req.params.id },
                );

                const r = updatedResource as Resource;

                res.status(200).json({
                    status: 200,
                    data: {
                        id: r.id as string,
                        data: r.data ?
                            JSON.parse(r.data as string) :
                            null,
                        created_ts: r.created_ts,
                        modified_ts: r.modified_ts,
                        deleted_ts: r.deleted_ts,
                    },
                });
            } else {
                res.status(400).json({
                    status: 400,
                    message: 'Bad input data. Too many fields or non string/integer values',
                });
            }


        } catch (error) {
            const message = error.toString();
            Logger.Err(message);
            return res.status(400).json({
                status: 401,
                message,
            });
        }
    }

    @Delete(':id')
    private async delete(req: Request, res: Response) {
        try {
            const authorized = await this.checkAuthorization(req.headers.authorization);

            if (!authorized) {
                res.status(401).json({
                    status: 401,
                    message: 'User is not allowed to perform this action',
                });
            }

            const resource = await Database.get<Resource>(
                'SELECT * from resources WHERE id = $id',
                { $id: req.params.id },
            );

            const now = new Date();

            await Database.run(
                'UPDATE resources SET data=null, deleted_ts=$deleted_ts WHERE id=$id',
                { $id: req.params.id, $deleted_ts: now },
            );

            const deletedResource = await Database.get<Resource>(
                'SELECT * from resources WHERE id = $id',
                { $id: req.params.id },
            );

            const r = deletedResource as Resource;

            res.status(200).json({
                status: 200,
                data: {
                    id: r.id as string,
                    data: r.data ?
                        JSON.parse(r.data as string) :
                        null,
                    created_ts: r.created_ts,
                    modified_ts: r.modified_ts,
                    deleted_ts: r.deleted_ts,
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

