import { BufferList } from "./buffer-list";
import { UnderflowError } from "./underflow-error";
import { Buffer } from "./buffer";

export class Stream {
    private buf = new ArrayBuffer(16);
    private uint8 = new Uint8Array(this.buf);
    private int8 = new Int8Array(this.buf);
    private uint16 = new Uint16Array(this.buf);
    private int16 = new Int16Array(this.buf);
    private uint32 = new Uint32Array(this.buf);
    private int32 = new Int32Array(this.buf);
    private float32 = new Float32Array(this.buf);
    private float64 = (Float64Array) ? new Float64Array(this.buf) : null;

    // True if little endian
    private nativeEndian = new Uint16Array(new Uint8Array([0x12, 0x34]).buffer)[0] == 0x3412;

    private list : BufferList;
    public localOffset: number;
    public offset: number;

    constructor(list : BufferList) {
        this.list = list;
        this.localOffset = 0;
        this.offset = 0;
    }

    static fromBuffer(buffer) : Stream {
        let list = new BufferList();
        list.append(buffer);
        return new Stream(list);
    }

    copy() : Stream {
        let res = new Stream(this.list.copy());
        res.localOffset = this.localOffset;
        res.offset = this.offset;
        return res;
    }

    available(bytes:number) : boolean {
        return bytes <= this.remainingBytes();
    }

    remainingBytes() : number {
        return this.list.availableBytes - this.localOffset;
    }

    advance(bytes: number) : Stream {
        if(!this.available(bytes))
            throw new UnderflowError();
        
        this.localOffset += bytes;
        this.offset += bytes;

        while(this.list.first && this.localOffset >= this.list.first.length) {
            this.localOffset -= this.list.first.length;
            this.list.advance();
        }

        return this;
    }

    rewind(bytes: number) : Stream {
        if(bytes > this.offset)
            throw new UnderflowError();
        
        if(!this.list.first) {
            this.list.rewind();
            this.localOffset = this.list.first.length;
        }

        this.localOffset -= bytes;
        this.offset -= bytes;

        while(this.list.first.prev && this.localOffset < 0) {
            this.list.rewind();
            this.localOffset += this.list.first.length;
        }

        return this;
    }

    seek(position: number) {
        if(position > this.offset) this.advance(position - this.offset);
        else if(position < this.offset) this.rewind(this.offset - position);
    }

    readUInt8() : number {
        if(!this.available(1)) throw new UnderflowError();
        let a = this.list.first.data[this.localOffset];
        this.localOffset += 1;
        this.offset += 1;

        if(this.localOffset == this.list.first.length) {
            this.localOffset = 0;
            this.list.advance();
        }

        return a;
    }

    peekUInt8(offset = 0) : number {
        if(!this.available(offset + 1)) throw new UnderflowError();

        offset = this.localOffset + offset;
        let buffer = this.list.first;
        while(buffer) {
            if(buffer.length > offset) {
                return buffer.data[offset];
            }

            offset -= buffer.length;
            buffer = buffer.next;
        }

        // TODO: We should not be able to reach this should we ?
        return 0;
    }

    read(bytes: number, litteEndian?: boolean) {
        if(!litteEndian) litteEndian = false;
        if(litteEndian == this.nativeEndian) {
            for(let i=0; i < bytes; i++) this.uint8[i] = this.readUInt8();
        } else {
            for(let i=0; i < bytes; i++) this.uint8[bytes - i - 1] = this.readUInt8();
        }
    }

    peek(bytes: number, offset: number, litteEndian?: boolean) {
        if(!litteEndian) litteEndian = false;
        if(litteEndian == this.nativeEndian) {
            for(let i=0; i < bytes; i++) this.uint8[i] = this.peekUInt8(offset + i);
        } else {
            for(let i=0; i < bytes; i++) this.uint8[bytes - i - 1] = this.peekUInt8(offset + i);
        }
    }

    readInt8() : number {
        this.read(1);
        return this.int8[0];
    }

    peekInt8(offset?: number) : number {
        if(!offset) offset = 0;
        this.peek(1, offset);
        return this.int8[0];
    }

    readUInt16(litteEndian?: boolean) : number {
        this.read(2, litteEndian);
        return this.uint16[0];
    }

    peekUInt16(offset?: number, litteEndian?: boolean) : number {
        if(!offset) offset = 0;
        this.peek(2, offset, litteEndian);
        return this.uint16[0];
    }

    readInt16(litteEndian?: boolean) : number {
        this.read(2, litteEndian);
        return this.int16[0];
    }

    peekInt16(offset?: number, litteEndian?: boolean) : number {
        if(!offset) offset = 0;
        this.peek(2, offset, litteEndian);
        return this.int16[0];
    }

    readUInt24(litteEndian?: boolean) : number {
        if(litteEndian) return this.readUInt16(true) + (this.readUInt8() << 16);
        else return (this.readUInt16(false) << 8) + this.readUInt8();
    }

    peekUInt24(offset?: number, litteEndian?: boolean) : number {
        if(!offset) offset = 0;
        if(litteEndian) return this.peekUInt16(offset, true) + (this.peekUInt8(offset + 2) << 16);
        else return (this.peekUInt16(offset) << 8) + this.peekUInt8(offset + 2);
    }

    readInt24(litteEndian?: boolean) : number {
        if(litteEndian) return this.readUInt16(true) + (this.readInt8() << 16);
        else return (this.readInt16(false) << 8) + this.readUInt8();
    }

    peekInt24(offset?: number, litteEndian?: boolean) : number {
        if(!offset) offset = 0;
        if(litteEndian) return this.peekUInt16(offset, true) + (this.peekInt8(offset + 2) << 16);
        else return (this.peekInt16(offset) << 8) + this.peekUInt8(offset + 2);
    }

    readUInt32(litteEndian?: boolean) : number {
        this.read(4, litteEndian);
        return this.uint32[0];
    }

    peekUInt32(offset?: number, litteEndian?: boolean) : number {
        if(!offset) offset = 0;
        this.peek(4, offset, litteEndian);
        return this.uint32[0];
    }

    readInt32(litteEndian?: boolean) : number {
        this.read(4, litteEndian);
        return this.int32[0];
    }

    peekInt32(offset?: number, litteEndian?: boolean) : number {
        if(!offset) offset = 0;
        this.peek(4, offset, litteEndian);
        return this.int32[0];
    }

    readFloat32(litteEndian?: boolean) : number {
        this.read(4, litteEndian);
        return this.float32[0];
    }

    peekFloat32(offset?: number, litteEndian?: boolean) : number {
        if(!offset) offset = 0;
        this.peek(4, offset, litteEndian);
        return this.float32[0];
    }

    readFloat64(litteEndian?: boolean) : number {
        this.read(8, litteEndian);
        if(this.float64) return this.float64[0];
        else return this.float64Fallback();
    }

    peekFloat64(offset?: number, litteEndian?: boolean) : number {
        if(!offset) offset = 0;
        this.peek(8, offset, litteEndian);
        if(this.float64) return this.float64[0];
        else return this.float64Fallback();
    }

    private float64Fallback() : number {
        let low = this.uint32[0];
        let high = this.uint32[1];
        if(high == 0 || high == 0x80000000) return 0.0;

        let sign = 1 - (high >>> 31) * 2;
        let exp = (high >>> 20) & 0x7ff;
        let frac = high & 0xffff;

        if(exp == 0x7ff) {
            if(frac) return NaN;
            return Infinity*sign;
        }

        exp -= 1023;
        let out = (frac | 0x100000) * Math.pow(2, exp - 20);
        out += low * Math.pow(2, exp - 52);

        return sign*out;
    }

    readFloat80(littleEndian?: boolean) {
        this.read(10, littleEndian);
        return this.float80();
    }

    peekFloat80(offset?: number, litteEndian?: boolean) {
        if(!offset) offset = 0;
        this.peek(10, offset, litteEndian);
        return this.float80();
    }

    private float80() {
        let high = this.uint32[0];
        let low = this.uint32[1];
        let a0 = this.uint8[9]
        let a1 = this.uint8[8]
        
        let sign = 1 - (a0 >>> 7) * 2;
        let exp = ((a0 & 0x7F) << 8) | a1;
        
        if(exp == 0 && low == 0 && high == 0) return 0;
            
        if(exp == 0x7fff) {
            if(low == 0 && high == 0) return sign * Infinity;
            else return NaN;
        }
        
        exp -= 16383;
        let out = low * Math.pow(2, exp - 31);
        out += high * Math.pow(2, exp - 63);
        
        return sign * out;
    }

    readBuffer(length: number) : Buffer {
        let res = Buffer.allocate(length);
        let to = res.data;

        for(let i =0; i<length; i++) {
            to[i] = this.readUInt8();
        }
        return res;
    }

    peekBuffer(offset: number, length: number) : Buffer {
        let res = Buffer.allocate(length);
        let to = res.data;

        for(let i =0; i<length; i++) {
            to[i] = this.peekUInt8(offset + i);
        }
        return res;
    }

    readSingleBuffer(length: number) : Buffer {
        let res = this.list.first.slice(this.localOffset, length);
        this.advance(res.length);
        return res;
    }

    peekSingleBuffer(offset: number, length: number) : Buffer {
        let res = this.list.first.slice(this.localOffset + offset, length);
        return res;
    }

    readString(length: number, encoding?: string) : string {
        if(!encoding) encoding = 'ascii';
        return this.decodeString(0, length, encoding, true);
    }

    peekString(offset: number, length: number, encoding?: string) : string {
        if(!encoding) encoding = 'ascii';
        return this.decodeString(offset, length, encoding, false);
    }

    private decodeString(offset: number, length: number, encoding: string, advance: boolean) : string {
        encoding = encoding.toLowerCase();
        let nullEnd = (length == null) ? 0 : -1;

        if(!length) length = Infinity;
        let end = offset + length;
        let result = '';

        switch(encoding) {
            case 'ascii':
            case 'latin1':
                let c;
                while (offset < end && (c = this.peekUInt8(offset++)) != nullEnd)
                    result += String.fromCharCode(c);
                break;

            case 'utf8':
            case 'utf-8':
                let b1: number;
                while (offset < end && (b1 = this.peekUInt8(offset++)) != nullEnd) {
                    if ((b1 & 0x80) == 0) {
                        result += String.fromCharCode(b1);

                    // one continuation (128 to 2047)
                    } else if( (b1 & 0xe0) == 0xc0) {
                        let b2 = (this.peekUInt8(offset++) & 0x3f);
                        result += String.fromCharCode(((b1 & 0x1f) << 6) | b2);

                    // two continuation (2048 to 55295 and 57344 to 65535)
                    } else if ((b1 & 0xf0) == 0xe0) {
                        let b2 = this.peekUInt8(offset++) & 0x3f;
                        let b3 = this.peekUInt8(offset++) & 0x3f;
                        result += String.fromCharCode(((b1 & 0x0f) << 12) | (b2 << 6) | b3);

                    // three continuation (65536 to 1114111)
                    } else if ((b1 & 0xf8) == 0xf0) {
                        let b2 = this.peekUInt8(offset++) & 0x3f;
                        let b3 = this.peekUInt8(offset++) & 0x3f;
                        let b4 = this.peekUInt8(offset++) & 0x3f;

                        // split into a surrogate pair
                        let pt = (((b1 & 0x0f) << 18) | (b2 << 12) | (b3 << 6) | b4) - 0x10000;
                        result += String.fromCharCode(0xd800 + (pt >> 10), 0xdc00 + (pt & 0x3ff));
                    }
                }
                break;

            case 'utf16-be':
            case 'utf16be':
            case 'utf16le':
            case 'utf16-le':
            case 'utf16bom':
            case 'utf16-bom':
                // find endianness
                let littleEndian = false;
                switch(encoding) {
                    case 'utf16le':
                    case 'utf16-le':
                        littleEndian = true;
                        break;

                    case 'utf16bom':
                    case 'utf16-bom':
                        let bom;
                        if (length < 2 || (bom = this.peekUInt16(offset)) == nullEnd) {
                            offset += 2;
                            if(advance) this.advance(offset);
                            return result;
                        }

                        littleEndian = (bom == 0xfffe);
                        offset += 2;
                }
                let w1;
                while(offset < end && (w1 = this.peekUInt16(offset, littleEndian)) != nullEnd) {
                    offset += 2;

                    if(w1 < 0xd800 || w1 > 0xdfff) result += String.fromCharCode(w1);
                    else{
                        if(w1 > 0xdbff) throw new Error("Invalid utf16 sequence.");

                        let w2 = this.peekUInt16(offset, littleEndian);
                        if(w2 < 0xdc00 || w2 > 0xdfff) throw new Error("Invalid utf16 sequence.");

                        result += String.fromCharCode(w1, w2);
                        offset += 2;
                    }
                }
                if(w1 == nullEnd) offset += 2;
                break;
            default:
                throw new Error("Unknown encoding: " + encoding);
        }

        if(advance) this.advance(offset);
        return result;
    }
};