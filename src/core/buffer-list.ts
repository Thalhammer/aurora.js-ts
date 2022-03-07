import { Buffer } from './buffer';

export class BufferList {
	public first: Buffer;
	public last: Buffer;
	public numBuffers: number;
	public availableBytes: number;
	public availableBuffers: number;

	constructor() {
		this.first = null;
		this.last = null;
		this.numBuffers = 0;
		this.availableBytes = 0;
		this.availableBuffers = 0;
	}

	copy(): BufferList {
		const result = new BufferList();
		result.first = this.first;
		result.last = this.last;
		result.numBuffers = this.numBuffers;
		result.availableBytes = this.availableBytes;
		result.availableBuffers = this.availableBuffers;
		return result;
	}

	append(buffer: Buffer) {
		buffer.prev = this.last;
		if (this.last) {
			this.last.next = buffer;
		}
		this.last = buffer;
		if (!this.first) {
			this.first = buffer;
		}

		this.availableBytes += buffer.length;
		this.availableBuffers++;
		this.numBuffers++;
	}

	advance(): boolean {
		if (this.first) {
			this.availableBytes -= this.first.length;
			this.availableBuffers--;
			this.first = this.first.next;
			return !(!this.first);
		}
		return false;
	}

	rewind(): boolean {
		if (this.first && !this.first.prev) {
			return false;
		}

		this.first = this.first ? this.first.prev : this.last;
		if (this.first) {
			this.availableBuffers++;
			this.availableBytes += this.first.length;
		}
		return !(!this.first);
	}

	reset() {
		while (this.rewind()){
			;
		}
	}
};
