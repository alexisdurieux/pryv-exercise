import { Dictionary, ErrorResponse, Credentials } from '../models';
import { Logger } from '@overnightjs/logger';
import fetch, { Response, RequestInit } from 'node-fetch';

export interface IService {
    get<T>(path: string, params: Dictionary<any>): Promise<T | ErrorResponse>;
    post<T>(path: string, body: Dictionary<any>): Promise<T | ErrorResponse>;
    put<T>(path: string, body: Dictionary<any>): Promise<T | ErrorResponse>;
    delete<T>(path: string, body: Dictionary<any>): Promise<T | ErrorResponse>;
}

export class Service implements IService {
    private BASE_ENDPOINT: string;
    private AUTHORIZATION_HEADERS: Dictionary<string>;
    constructor(private credentials: Credentials) {
        credentials = credentials;
        this.BASE_ENDPOINT = `https://${credentials.username}.pryv.me`;
        this.AUTHORIZATION_HEADERS = {
            Host: `${credentials.username}.pryv.me`,
            Authorization: credentials.token,
        };
    }

    private okStatus(status: number): boolean {
        return Math.floor(status / 100)  === 2;
    }

    private formatQueryString(params: Dictionary<any>): string {
        const queryString = Object.keys(params).map((key) => `${key}=${params[key]}`).join('&');
        return queryString ? '?' + queryString : '';
    }


    public async get<T>(endpoint: string, params: Dictionary<any>): Promise<T | ErrorResponse> {
        const queryString = this.formatQueryString(params);
        const options: RequestInit = {
            headers: {
                ...this.AUTHORIZATION_HEADERS,
            },
            method: 'GET',
        };
        const fullEndpoint = `${this.BASE_ENDPOINT}/${endpoint}${queryString}`;
        const res: Response = await fetch(fullEndpoint, options);
        const data: any = await res.json();
        if (this.okStatus(res.status)) {
            return (data as T);
        } else {
            Logger.Err(`Error on request ${res.status} on endpoint ${fullEndpoint}`);
            return (data as ErrorResponse);
        }
    }

    public async post<T>(endpoint: string, body: Dictionary<any>): Promise<T | ErrorResponse> {
        const stringifiedBody = JSON.stringify(body);
        const options: RequestInit = {
            headers: {
                ...this.AUTHORIZATION_HEADERS,
                'Content-Type': 'application/json',
            },
            body: stringifiedBody,
            method: 'POST',
        };
        const res: Response = await fetch(`${this.BASE_ENDPOINT}/${endpoint}`, options);
        const dataResponse: any = await res.json();

        if (this.okStatus(res.status)) {
            return (dataResponse as T);
        } else {
            Logger.Err(`Error on post request ${res.status} on endpoint ${endpoint}`);
            return (dataResponse as ErrorResponse);
        }
    }

    public async put<T>(endpoint: string, body: Dictionary<any>): Promise<T | ErrorResponse> {
        const stringifiedBody = JSON.stringify(body);
        const options: RequestInit = {
            headers: {
                ...this.AUTHORIZATION_HEADERS,
                'Content-Type': 'application/json',
            },
            body: stringifiedBody,
            method: 'PUT',
        };
        const res: Response = await fetch(`${this.BASE_ENDPOINT}/${endpoint}`, options);
        const dataResponse: any = await res.json();
        if (this.okStatus(res.status)) {
            return (dataResponse as T);
        } else {
            Logger.Err(`Error on put request ${res.status} on endpoint ${endpoint}`);
            return (dataResponse as ErrorResponse);
        }
    }

    public async delete<T>(endpoint: string, body: Dictionary<any>) {
        const stringifiedBody = JSON.stringify(body);
        const options: RequestInit = {
            headers: {
                ...this.AUTHORIZATION_HEADERS,
                'Content-Type': 'application/json',
            },
            body: stringifiedBody,
            method: 'DELETE',
        };
        const res: Response = await fetch(`${this.BASE_ENDPOINT}/${endpoint}`, options);
        const dataResponse: any = await res.json();
        if (this.okStatus(res.status)) {
            return (dataResponse as T);
        } else {
            Logger.Err(`Error on delete request ${res.status} on endpoint ${endpoint}`);
            return (dataResponse as ErrorResponse);
        }
    }

}




