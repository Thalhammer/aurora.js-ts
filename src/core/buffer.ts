// eslint-disable-next-line
declare let BlobBuilder;

export class Buffer {
	public data: Uint8Array;
	public next: Buffer;
	public prev: Buffer;

	constructor(input: any) {
		if (input instanceof Uint8Array || input.constructor.name === 'Uint8Array') {
			this.data = input;
		} else if (input instanceof ArrayBuffer || Array.isArray(input) || input.constructor.name === 'ArrayBuffer'
			|| (typeof global !== 'undefined' && global.Buffer && global.Buffer.isBuffer(input))) {
			this.data = new Uint8Array(input as ArrayBuffer);
		} else if (typeof input === 'number') { // This is split from above to make typescript happy
			this.data = new Uint8Array(input as number);
		} else if (input.buffer && (input.buffer instanceof ArrayBuffer || input.buffer.constructor.name === 'ArrayBuffer')) {
			this.data = new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
		} else if (input instanceof Buffer || input.constructor.name === 'Buffer') {
			this.data = input.data;
		} else {
			throw new Error('Constructing buffer with unknown type.');
		}
		this.next = null;
		this.prev = null;
	}

	get length() {
		return this.data.length;
	}

	static allocate(size: number) {
		return new Buffer(size);
	}

	static makeBlob(data: any, type?: string): Blob {
		if (!type) {
			type = 'application/octet-stream';
		}

		if (Blob) {
			return new Blob([data], { type: type });
		}

		if (BlobBuilder) {
			const b = new BlobBuilder();
			b.append(data);
			return b.getBlob(type);
		}
		return null;
	}

	static makeBlobURL(data: any, type?: string): string {
		if (!URL) {
			return null;
		}
		return URL.createObjectURL(this.makeBlob(data, type));
	}

	static revokeBlobURL(url: string) {
		if (!URL) {
			return;
		}
		URL.revokeObjectURL(url);
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
		if (!length) {
			length = this.length;
		}
		if (position === 0 && length >= this.length) {
			return new Buffer(this.data);
		} else {
			return new Buffer(this.data.subarray(position, position + length));
		}
	}
};
