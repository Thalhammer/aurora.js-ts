import { EventHost } from "./core";
import { Asset } from "./asset";
export declare class Queue extends EventHost {
    private readMark;
    private finished;
    private buffering;
    ended: boolean;
    private buffers;
    private asset;
    constructor(asset: Asset);
    write(buffer: any): void;
    read(): any;
    reset(): void;
}
