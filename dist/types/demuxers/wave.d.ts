import { Demuxer } from "../demuxer";
import { Stream } from '../core';
export declare class WAVEDemuxer extends Demuxer {
    static probe(stream: Stream): boolean;
    static formats: {
        [idx: number]: string;
    };
    private fileSize;
    private readStart;
    private readHeaders;
    private type;
    private len;
    private sentDuration;
    init(): void;
    readChunk(): void;
}
