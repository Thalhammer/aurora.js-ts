import { Demuxer } from '../demuxer';
export declare class AUDemuxer extends Demuxer {
    static readonly bps: {
        0: number;
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
        6: number;
        26: number;
    };
    static readonly formats: {
        1: string;
        27: string;
    };
    private readHeader;
    static probe(buffer: any): boolean;
    init(): void;
    readChunk(): void;
}
