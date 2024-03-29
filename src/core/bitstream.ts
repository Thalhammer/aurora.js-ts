import { Stream } from './stream';

export class Bitstream {
	public stream: Stream;
	public bitPosition: number;

	constructor(stream: Stream) {
		this.stream = stream;
		this.bitPosition = 0;
	}

	copy(): Bitstream {
		const res = new Bitstream(this.stream.copy());
		res.bitPosition = this.bitPosition;
		return res;
	}

	offset(): number {
		return this.stream.offset * 8 + this.bitPosition;
	}

	available(bits: number): boolean {
		return this.stream.available((bits + 8 - this.bitPosition) / 8);
	}

	advance(bits: number) {
		const pos = this.bitPosition + bits;
		this.stream.advance(pos >> 3);
		this.bitPosition = pos & 7;
	}

	rewind(bits: number) {
		const pos = this.bitPosition - bits;
		this.stream.rewind(Math.abs(pos >> 3));
		this.bitPosition = pos & 7;
	}

	seek(offset) {
		const curOffset = this.offset();
		if (offset > curOffset) {
			return this.advance(offset - curOffset);
		} else if (offset < curOffset) {
			return this.rewind(curOffset - offset);
		}
	}

	align() {
		if (this.bitPosition !== 0) {
			this.bitPosition = 0;
			this.stream.advance(1);
		}
	}

	read(bits: number, signed?: boolean) {
		const res = this.peek(bits, signed);
		this.advance(bits);
		return res;
	}

	peek(bits: number, signed?: boolean) {
		if (bits === 0) {
			return 0;
		}
		const mBits = bits + this.bitPosition;
		let a: any;
		if (mBits <= 8) {
			a = ((this.stream.peekUInt8() << this.bitPosition) & 0xff) >>> (8 - bits);
		} else if (mBits <= 16) {
			a = ((this.stream.peekUInt16() << this.bitPosition) & 0xffff) >>> (16 - bits);
		} else if (mBits <= 24) {
			a = ((this.stream.peekUInt24() << this.bitPosition) & 0xffffff) >>> (24 - bits);
		} else if (mBits <= 32) {
			a = (this.stream.peekUInt32() << this.bitPosition) >>> (32 - bits);
		} else if (mBits <= 40) {
			const a0 = this.stream.peekUInt8(0) * 0x0100000000;
			const a1 = this.stream.peekUInt8(1) << 24 >>> 0;
			const a2 = this.stream.peekUInt8(2) << 16;
			const a3 = this.stream.peekUInt8(3) << 8;
			const a4 = this.stream.peekUInt8(4);

			a = a0 + a1 + a2 + a3 + a4;
			a %= Math.pow(2, 40 - this.bitPosition);
			a = Math.floor(a / Math.pow(2, 40 - this.bitPosition - bits));
		} else {
			throw new Error('Too many bits!');
		}
		if (signed) {
			if (mBits < 32) {
				if (a >>> (bits - 1)) {
					a = ((1 << bits >>> 0) - a) * -1;
				}
			} else {
				if (a / Math.pow(2, bits - 1) | 0) {
					a = (Math.pow(2, bits) - a) * -1;
				}
			}
		}
		return a;
	}

	readLSB(bits: number, signed?: boolean) {
		const res = this.peekLSB(bits, signed);
		this.advance(bits);
		return res;
	}

	peekLSB(bits: number, signed?: boolean) {
		if (bits === 0) {
			return 0;
		}
		if (bits > 40) {
			throw new Error('Too many bits!');
		}
		const mBits = bits + this.bitPosition;
		let a = (this.stream.peekUInt8(0)) >>> this.bitPosition;
		if (mBits > 8) {
			a |= (this.stream.peekUInt8(1)) << (8 - this.bitPosition);
		}
		if (mBits > 16) {
			a |= (this.stream.peekUInt8(2)) << (16 - this.bitPosition);
		}
		if (mBits > 24) {
			a += (this.stream.peekUInt8(3)) << (24 - this.bitPosition) >>> 0;
		}
		if (mBits > 32) {
			a += (this.stream.peekUInt8(4)) * Math.pow(2, 32 - this.bitPosition);
		}

		if (mBits >= 32) {
			a %= Math.pow(2, bits);
		} else {
			a &= (1 << bits) - 1;
		}

		if (signed) {
			if (mBits < 32) {
				if (a >>> (bits - 1)) {
					a = ((1 << bits >>> 0) - a) * -1;
				}
			} else {
				if (a / Math.pow(2, bits - 1) | 0) {
					a = (Math.pow(2, bits) - a) * -1;
				}
			}
		}
		return a;
	}
};
