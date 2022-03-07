import { Buffer } from './buffer';
export declare class BufferList {
    first: Buffer;
    last: Buffer;
    numBuffers: number;
    availableBytes: number;
    availableBuffers: number;
    constructor();
    copy(): BufferList;
    append(buffer: Buffer): void;
    advance(): boolean;
    rewind(): boolean;
    reset(): void;
}
