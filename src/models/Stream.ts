import { Dictionary } from './Dictionnary';
import { Meta } from './Meta';

export interface Stream {
    id: string;
    name: string;
    parentId?: string;
    singleActivity?: boolean;
    clientData?: Dictionary<any>;
    children: Stream[];
    trashed?: boolean;
    created: number;
    createdBy: string;
    modified: number;
    modifiedBy: string;
}

export interface StreamsResponse {
    meta: Meta;
    streams: Stream[];
}

