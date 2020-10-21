export declare class Buffer {
    data: Uint8Array;
    next: Buffer;
    prev: Buffer;
    readonly length: number;
    constructor(input: any);
    toBlob(): Blob;
    toBlobURL(): string;
    copy(): Buffer;
    slice(position: number, length?: number): Buffer;
    static allocate(size: number): Buffer;
    static makeBlob(data: any, type?: string): Blob;
    static makeBlobURL(data: any, type?: string): string;
    static revokeBlobURL(url: string): void;
}
