/// <reference types="node" />
import * as AV from '../core';
import * as http from 'http';
export declare class HTTPSource extends AV.EventHost {
    private url;
    private opts?;
    private request;
    private response;
    private loaded;
    private size;
    constructor(url: string, opts?: any);
    start(): http.IncomingMessage;
    pause(): void;
    private reset;
    private errorHandler;
}
