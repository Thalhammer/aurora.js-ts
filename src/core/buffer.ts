declare var BlobBuilder;

export class Buffer {
    public data: Uint8Array;
    public next: Buffer;
    public prev: Buffer;

    get length() { return this.data.length; }
    constructor(input: any)
    {
        if(input instanceof Uint8Array){
            this.data = input;
        } else if(input instanceof ArrayBuffer || Array.isArray(input) || (global.Buffer && global.Buffer.isBuffer(input))) {
            this.data = new Uint8Array(input as ArrayBuffer);
        } else if(typeof input === "number") { // This is split from above to make typescript happy
            this.data = new Uint8Array(input as number);
        } else if(input.buffer instanceof ArrayBuffer) {
            this.data = new Uint8Array(input.buffer, input.byteOffset, input.length * input.BYTES_PER_ELEMENT);
        } else if(input instanceof Buffer) {
            this.data = input.data;
        } else throw new Error("Constructing buffer with unknown type.");
        this.next = null;
        this.prev = null;
    }

    toBlob(): Blob {
        return Buffer.makeBlob(this.data.buffer);
    }

    toBlobURL(): string {
        return Buffer.makeBlobURL(this.data.buffer);
    }

    copy() {
        return new Buffer(new Uint8Array(this.data));
    }

    slice(position: number, length?: number) {
        if(!length) length = this.length;
        if(position==0 && length >= this.length) return new Buffer(this.data);
        else return new Buffer(this.data.subarray(position, position + length));
    }

    static allocate(size: number) {
        return new Buffer(size);
    }

    static makeBlob(data: any, type? : string): Blob {
        if(!type) type = "application/octet-stream";
        
        if(Blob) return new Blob([data], { type: type });
        
        if(BlobBuilder) {
            let b = new BlobBuilder();
            b.append(data);
            return b.getBlob(type);
        }
        return null;
    }

    static makeBlobURL(data: any, type?: string) : string {
        if(!URL) return null;
        return URL.createObjectURL(this.makeBlob(data, type));
    }

    static revokeBlobURL(url: string) {
        if(!URL) return;
        URL.revokeObjectURL(url);
    }
};