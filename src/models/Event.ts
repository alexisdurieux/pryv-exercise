import { Dictionary } from './Dictionnary';
import { Meta } from './Meta';

export interface Event {
    id?: string;
    streamId: string;
    time?: number;
    duration?: number;
    type: string;
    content?: any;
    tags?: string[];
    description?: string;
    attachments?: Attachment[];
    clientData?: Dictionary<any>;
    trashed?: boolean;
    created?: number;
    createdBy?: string;
    modified?: number;
    modifiedBy?: string;
}

interface Attachment {
    id: string;
    fileName: string;
    type: string;
    size: number;
    readToken: string;
}


export interface EventsResponse {
    meta: Meta;
    events: Event[];
}

export interface EventResponse {
    meta: Meta;
    event: Event;
}
