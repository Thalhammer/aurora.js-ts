import * as AV from '../core';
export declare class HTTPSource extends AV.EventHost {
    private file;
    private opts?;
    private chunkSize;
    private inflight;
    private length;
    private xhr;
    private offset;
    constructor(file: any, opts?: any);
    start(): void;
    pause(): void;
    private loop;
    private reset;
}
