import { Demuxer } from '../demuxer';
export declare class AIFFDemuxer extends Demuxer {
    private readStart;
    private fileSize;
    private fileType;
    private readHeaders;
    private readSSNDHeader;
    private type;
    private len;
    static probe(buffer: any): boolean;
    init(): void;
    readChunk(): void;
}
