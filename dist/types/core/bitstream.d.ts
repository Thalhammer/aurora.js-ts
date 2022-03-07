import { Stream } from './stream';
export declare class Bitstream {
    stream: Stream;
    bitPosition: number;
    constructor(stream: Stream);
    copy(): Bitstream;
    offset(): number;
    available(bits: number): boolean;
    advance(bits: number): void;
    rewind(bits: number): void;
    seek(offset: any): void;
    align(): void;
    read(bits: number, signed?: boolean): any;
    peek(bits: number, signed?: boolean): any;
    readLSB(bits: number, signed?: boolean): number;
    peekLSB(bits: number, signed?: boolean): number;
}
