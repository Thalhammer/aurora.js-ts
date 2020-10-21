import { Demuxer } from '../demuxer';
export declare class AIFFDemuxer extends Demuxer {
    init(): void;
    static probe(buffer: any): boolean;
    private readStart;
    private fileSize;
    private fileType;
    private readHeaders;
    private readSSNDHeader;
    private type;
    private len;
    readChunk(): void;
}
