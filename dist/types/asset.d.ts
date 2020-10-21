import { EventHost } from './core';
import { Decoder } from './decoder';
import { ISource } from './source';
export declare class Asset extends EventHost {
    private source;
    private buffered;
    private duration;
    private format;
    private metadata;
    private active;
    private shouldDecode;
    private demuxer;
    decoder: Decoder;
    constructor(source: ISource);
    static fromURL(url: any, opts: any): Asset;
    static fromFile(file: any): Asset;
    static fromBuffer(buffer: any): Asset;
    start(decode?: boolean): void;
    stop(): void;
    get(event: 'format' | 'duration' | 'metadata', callback: any): any;
    decodePacket(): void;
    decodeToBuffer(callback: any): void;
    probe(chunk: any): void;
    findDecoder(format: any): void;
    private _decode;
    destroy(): void;
}
