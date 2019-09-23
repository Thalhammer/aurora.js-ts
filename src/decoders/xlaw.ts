import { Decoder } from '../decoder';

export class XLAWDecoder extends Decoder {
    setCookie(cookie: any) {}
    static readonly SIGN_BIT   = 0x80
    static readonly QUANT_MASK = 0xf
    static readonly SEG_SHIFT  = 4
    static readonly SEG_MASK   = 0x70
    static readonly BIAS       = 0x84

    private table : Int16Array;
    
    init() {
        this.format.bitsPerChannel = 16;
        this.table = new Int16Array(256);
        
        if (this.format.formatID == 'ulaw') {
            for(let i = 0; i<this.table.length; i++) {
                // Complement to obtain normal u-law value.
                let val = ~i;
            
                // Extract and bias the quantization bits. Then
                // shift up by the segment number and subtract out the bias.
                let t = ((val & XLAWDecoder.QUANT_MASK) << 3) + XLAWDecoder.BIAS;
                t <<= (val & XLAWDecoder.SEG_MASK) >>> XLAWDecoder.SEG_SHIFT
            
                this.table[i] = (val & XLAWDecoder.SIGN_BIT) ? (XLAWDecoder.BIAS - t) : (t - XLAWDecoder.BIAS);
            }
        } else {
            for(let i = 0; i<this.table.length; i++) {
                let val = i ^ 0x55;
                let t = val & XLAWDecoder.QUANT_MASK;
                let seg = (val & XLAWDecoder.SEG_MASK) >>> XLAWDecoder.SEG_SHIFT;
                
                if(seg) t = (t + t + 1 + 32) << (seg + 2);
                else t = (t + t + 1) << 3;
                    
                this.table[i] = (val & XLAWDecoder.SIGN_BIT) ? t : -t;
            }
        }
    }

    readChunk() {
        let samples = Math.min(4096, this.stream.remainingBytes());
        if(samples == 0) return null;
        
        let output = new Int16Array(samples);
        for(let i = 0; i<samples; i++)
            output[i] = this.table[this.stream.readUInt8()];
            
        return output
    }
}

Decoder.register('ulaw', XLAWDecoder);
Decoder.register('alaw', XLAWDecoder);