import { Dictionary } from './Dictionnary';
import Database from '../Database';

export interface Resource {
    id?: string;
    data?: Dictionary<number | string> | string;
    created_ts: Date;
    modified_ts: Date;
    deleted_ts?: Date;
}

export class ResourceModel {
    public static async getModel(id: string): Promise<Resource | undefined> {
        return await Database.getInstanceDb()
            .select('*')
            .from<Resource>('resources')
            .where('id', id)
            .first();
    }

    public static async getModels(): Promise<Resource[]> {
        return await Database.getInstanceDb()
            .select('*')
            .from<Resource>('resources')
            .orderBy('created_ts', 'desc');
    }

    public static async updateModel(id: string, data: string): Promise<number> {
        const now = new Date();
        return await Database.getInstanceDb()
            .from('resources')
            .update({
                data,
                modified_ts: now,
            }).where('id', id);
    }

    public static async deleteModel(id: string): Promise<void> {
        const now = new Date();
        await Database.getInstanceDb()
            .from('resources')
            .update({data: null, deleted_ts: now}).where('id', id);
    }

    public static async createModel(resource: Resource): Promise<Resource> {
        return await Database.getInstanceDb().from<Resource>('resources')
            .insert(resource);

    }
}
