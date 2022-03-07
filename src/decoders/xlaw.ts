import { Decoder } from '../decoder';

export class XLAWDecoder extends Decoder {
	static readonly signBit = 0x80;
	static readonly quantMask = 0xf;
	static readonly segShift = 4;
	static readonly segMask = 0x70;
	static readonly bias = 0x84;

	private table: Int16Array;

	setCookie(cookie: any) { }

	init() {
		this.format.bitsPerChannel = 16;
		this.table = new Int16Array(256);

		if (this.format.formatID === 'ulaw') {
			for (let i = 0; i < this.table.length; i++) {
				// Complement to obtain normal u-law value.
				const val = ~i;

				// Extract and bias the quantization bits. Then
				// shift up by the segment number and subtract out the bias.
				let t = ((val & XLAWDecoder.quantMask) << 3) + XLAWDecoder.bias;
				t <<= (val & XLAWDecoder.segMask) >>> XLAWDecoder.segShift;

				this.table[i] = (val & XLAWDecoder.signBit) ? (XLAWDecoder.bias - t) : (t - XLAWDecoder.bias);
			}
		} else {
			for (let i = 0; i < this.table.length; i++) {
				const val = i ^ 0x55;
				let t = val & XLAWDecoder.quantMask;
				const seg = (val & XLAWDecoder.segMask) >>> XLAWDecoder.segShift;

				if (seg) {
					t = (t + t + 1 + 32) << (seg + 2);
				} else {
					t = (t + t + 1) << 3;
				}

				this.table[i] = (val & XLAWDecoder.signBit) ? t : -t;
			}
		}
	}

	readChunk() {
		const samples = Math.min(4096, this.stream.remainingBytes());
		if (samples === 0) {
			return null;
		}

		const output = new Int16Array(samples);
		for (let i = 0; i < samples; i++) {
			output[i] = this.table[this.stream.readUInt8()];
		}

		return output;
	}
}

Decoder.register('ulaw', XLAWDecoder);
Decoder.register('alaw', XLAWDecoder);
