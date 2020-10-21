import { Decoder } from '../decoder';
export declare class LPCMDecoder extends Decoder {
    init(): void;
    setCookie(cookie: any): void;
    readChunk(): Int8Array | Int16Array | Int32Array | Float32Array | Float64Array;
}
