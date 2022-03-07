import { Decoder } from '../decoder';
export declare class XLAWDecoder extends Decoder {
    static readonly signBit = 128;
    static readonly quantMask = 15;
    static readonly segShift = 4;
    static readonly segMask = 112;
    static readonly bias = 132;
    private table;
    setCookie(cookie: any): void;
    init(): void;
    readChunk(): Int16Array;
}
