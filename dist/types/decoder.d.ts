import { EventHost, Stream, Bitstream } from "./core";
import { Demuxer } from "./demuxer";
export interface DecoderRegistration {
    new (demuxer: Demuxer, format: any): Decoder;
}
export declare abstract class Decoder extends EventHost {
    protected stream: Stream;
    protected bitstream: Bitstream;
    private receivedFinalBuffer;
    private waiting;
    protected demuxer: Demuxer;
    protected format: any;
    constructor(demuxer: any, format: any);
    abstract init(): any;
    abstract setCookie(cookie: any): any;
    abstract readChunk(): any;
    decode(): boolean;
    seek(timestamp: any): number;
    private static codecs;
    static register(id: string, decoder: DecoderRegistration): void;
    static find(id: string): DecoderRegistration;
}
