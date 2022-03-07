import { EventHost, Stream, Bitstream } from './core';
import { Demuxer } from './demuxer';
export declare type DecoderRegistration = new (demuxer: Demuxer, format: any) => Decoder;
export declare abstract class Decoder extends EventHost {
    private static codecs;
    protected stream: Stream;
    protected bitstream: Bitstream;
    protected demuxer: Demuxer;
    protected format: any;
    private receivedFinalBuffer;
    private waiting;
    constructor(demuxer: any, format: any);
    static register(id: string, decoder: DecoderRegistration): void;
    static find(id: string): DecoderRegistration;
    decode(): boolean;
    seek(timestamp: any): number;
    abstract init(): any;
    abstract setCookie(cookie: any): any;
    abstract readChunk(): any;
}
