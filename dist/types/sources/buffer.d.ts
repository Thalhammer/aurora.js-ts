import { ISource } from '../source';
import { BufferList, Buffer, EventHost } from '../core';
export declare class BufferSource extends EventHost implements ISource {
    private list;
    private paused;
    private _timer;
    constructor(input: BufferList | Buffer | ArrayBuffer);
    private setImmediate;
    private clearImmediate;
    start(): void;
    loop(): void;
    pause(): void;
    reset(): void;
}
