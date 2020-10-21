import * as AV from '../core';
export declare class FileSource extends AV.EventHost {
    private file;
    private offset;
    private length;
    private chunkSize;
    private reader;
    private active;
    constructor(file: File | Blob);
    start(): void;
    private loop;
    pause(): void;
    reset(): void;
}
