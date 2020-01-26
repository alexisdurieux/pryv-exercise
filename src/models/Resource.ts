import { Dictionary } from './Dictionnary';

export interface Resource {
    id?: string;
    data?: Dictionary<number | string> | string;
    created_ts: number;
    modified_ts: number;
    deleted_ts: number;
}
