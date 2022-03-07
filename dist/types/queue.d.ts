import { EventHost } from './core';
import { Asset } from './asset';
export declare class Queue extends EventHost {
    ended: boolean;
    private readMark;
    private finished;
    private buffering;
    private buffers;
    private asset;
    constructor(asset: Asset);
    write(buffer: any): void;
    read(): any;
    reset(): void;
}
