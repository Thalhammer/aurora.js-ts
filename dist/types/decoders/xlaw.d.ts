import { Decoder } from '../decoder';
export declare class XLAWDecoder extends Decoder {
    setCookie(cookie: any): void;
    static readonly SIGN_BIT: number;
    static readonly QUANT_MASK: number;
    static readonly SEG_SHIFT: number;
    static readonly SEG_MASK: number;
    static readonly BIAS: number;
    private table;
    init(): void;
    readChunk(): Int16Array;
}
