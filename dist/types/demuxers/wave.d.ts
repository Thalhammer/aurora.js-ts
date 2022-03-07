import { Demuxer } from '../demuxer';
import { Stream } from '../core';
export declare class WAVEDemuxer extends Demuxer {
    static formats: {
        [idx: number]: string;
    };
    private fileSize;
    private readStart;
    private readHeaders;
    private type;
    private len;
    private sentDuration;
    static probe(stream: Stream): boolean;
    init(): void;
    readChunk(): void;
}
