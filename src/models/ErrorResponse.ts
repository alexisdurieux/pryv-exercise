import { Meta } from './Meta';

export interface ErrorResponse {
    meta: Meta;
    error: ErrorInfo;
}

export interface ErrorInfo {
    id: string;
    message: string;
    data?: any;
    subErrors?: Error[];
}
