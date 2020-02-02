import { Request, Response, NextFunction } from 'express';
import { Controller, Post, Get, Delete, Put, Middleware } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import cuid from 'cuid';
import { Dictionary } from 'src/models';
import { TokenModel } from '../models/Token';
import { Resource, ResourceModel } from '../models/Resource';
import { isNumber, isString } from 'util';
import { ErrorMessage } from '../ErrorMessage';

async function checkAuthorization(authorization: string | undefined): Promise<boolean> {
    if (!authorization) {
        return false;
    }

    const token = await TokenModel.getToken(authorization);

    Logger.Info(`token ${token}`);

    return token ? true : false;
}

async function resourceExists(req: Request, res: Response, next: NextFunction) {
    if (!req.params.id) {
        res.status(404).json({
            message: ErrorMessage.ENTITY_NOT_FOUND,
        });
    }

    const resource = await ResourceModel.getModel(req.params.id);

    if (!resource) {
        res.status(404).json({
            message: ErrorMessage.ENTITY_NOT_FOUND,
        });
    } else {
        next();
    }
}

async function checkAuthorizationMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;
    if (!token) {
        res.status(401).json({
            message: ErrorMessage.ACCESS_TOKEN_NOT_FOUND,
        });
    }

    const authorized = await checkAuthorization(token);

    if (!authorized) {
        res.status(401).json({
            message: ErrorMessage.INVALID_ACCESS_TOKEN,
        });
    }

    next();
}

@Controller('resources')
export class ResourceController {
    private checkResourceData(data: Dictionary<number | string> | undefined): boolean {
        if (!data) {
            return false;
        }
        return (Object.keys(data).length <= 10 && Object.values(data).map((v) => {
            return isNumber(v) || isString(v);
        }).reduce((a, b) => a && b));
    }

    @Get(':id')
    @Middleware([checkAuthorizationMiddleware, resourceExists])
    private async get(req: Request, res: Response) {
        try {
            const resourceOrUndefined = await ResourceModel.getModel(req.params.id);
            const resource = resourceOrUndefined as Resource;

            res.status(200).json({
                status: 200,
                resource: {
                    id: resource.id as string,
                    data: resource.data ?
                        JSON.parse(resource.data as string) :
                        null,
                    created_ts: resource.created_ts,
                    modified_ts: resource.modified_ts,
                    deleted_ts: resource.deleted_ts,
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

    @Get('')
    @Middleware([checkAuthorizationMiddleware])
    private async getAll(req: Request, res: Response) {
        try {
            // Warning. This should be paginated. Ok for the scope of the exercise
            const results = await ResourceModel.getModels();

            res.status(200).json({
                status: 200,
                resources: results.map((resource) => {
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
    @Middleware([checkAuthorizationMiddleware])
    private async createResource(req: Request, res: Response) {
        try {
            const newResource = req.body as Resource;
            const now = new Date();
            const id = newResource.id ? newResource.id : cuid();

            if (this.checkResourceData(
                newResource.data as Dictionary<string | number> | undefined)
                ) {
                await ResourceModel.createModel(
                    {
                        id,
                        data: JSON.stringify(newResource.data),
                        created_ts: now,
                        modified_ts: now,
                    },
                );

                const createdResource = await ResourceModel.getModel(id);

                const r = createdResource as Resource;

                res.status(200).json({
                    status: 200,
                    resource: {
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
    @Middleware([checkAuthorizationMiddleware, resourceExists])
    private async updateResource(req: Request, res: Response) {
        try {
            const updateData = (req.body as Resource);

            const resourceOrUndefined = await ResourceModel.getModel(req.params.id);
            const resource = resourceOrUndefined as Resource;

            if ((resource as Resource).deleted_ts) {
                res.status(400).json({
                    status: 404,
                    message: ErrorMessage.RESOURCE_DELETED,
                });
            }

            if (this.checkResourceData(
                updateData.data as Dictionary<string | number> | undefined)
                ) {

                await ResourceModel.updateModel(req.params.id, JSON.stringify(updateData.data));

                const updatedResource = await ResourceModel.getModel(req.params.id);

                const r = updatedResource as Resource;

                res.status(200).json({
                    status: 200,
                    resource: {
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
    @Middleware([checkAuthorizationMiddleware, resourceExists])
    private async delete(req: Request, res: Response) {
        try {
            await ResourceModel.deleteModel(req.params.id);

            res.status(200).json({
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

