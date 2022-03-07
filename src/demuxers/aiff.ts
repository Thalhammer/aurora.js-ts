import { Demuxer } from '../demuxer';

export class AIFFDemuxer extends Demuxer {
	private readStart: boolean;
	private fileSize: number;
	private fileType: string;
	private readHeaders: boolean;
	private readSSNDHeader: boolean;
	private type: string;
	private len: number;

	static probe(buffer) {
		const s = buffer.peekString(8, 4);
		return buffer.peekString(0, 4) === 'FORM' && (s === 'AIFF' || s === 'AIFC');
	}

	init() {
	}

	readChunk() {
		if (!this.readStart && this.stream.available(12)) {
			if (this.stream.readString(4) !== 'FORM') {
				return this.emit('error', 'Invalid AIFF.');
			}

			this.fileSize = this.stream.readUInt32();
			this.fileType = this.stream.readString(4);
			this.readStart = true;

			if (this.fileType !== 'AIFF' && this.fileType !== 'AIFC') {
				return this.emit('error', 'Invalid AIFF.');
			}
		}

		while (this.stream.available(1)) {
			if (!this.readHeaders && this.stream.available(8)) {
				this.type = this.stream.readString(4);
				this.len = this.stream.readUInt32();
			}
			switch (this.type) {
			case 'COMM':
				if (!this.stream.available(this.len)) {
					return;
				}

				this.format = {
					formatID: 'lpcm',
					channelsPerFrame: this.stream.readUInt16(),
					sampleCount: this.stream.readUInt32(),
					bitsPerChannel: this.stream.readUInt16(),
					sampleRate: this.stream.readFloat80(),
					framesPerPacket: 1,
					littleEndian: false,
					floatingPoint: false
				};

				this.format.bytesPerPacket = (this.format.bitsPerChannel / 8) * this.format.channelsPerFrame;

				if (this.fileType === 'AIFC') {
					let format = this.stream.readString(4);

					this.format.littleEndian = format === 'sowt' && this.format.bitsPerChannel > 8;
					this.format.floatingPoint = format === 'fl32' || format === 'fl64';

					if (['twos', 'sowt', 'fl32', 'fl64', 'NONE'].indexOf(format) !== -1) {
						format = 'lpcm';
					}
					this.format.formatID = format;
					this.len -= 4;
				}
				this.stream.advance(this.len - 18);
				this.emit('format', this.format);
				this.emit('duration', this.format.sampleCount / this.format.sampleRate * 1000 | 0);
				break;
			case 'SSND':
				if (!(this.readSSNDHeader && this.stream.available(4))) {
					const offset = this.stream.readUInt32();
					this.stream.advance(4); // skip block size
					this.stream.advance(offset); // skip to data
					this.readSSNDHeader = true;
				}

				const buffer = this.stream.readSingleBuffer(this.len);
				this.len -= buffer.length;
				this.readHeaders = this.len > 0;
				this.emit('data', buffer);
				break;
			default:
				if (!this.stream.available(this.len)) {
					return;
				}
				this.stream.advance(this.len);
			}
			if (this.type !== 'SSND') {
				this.readHeaders = false;
			}
		}
	}
}

Demuxer.register(AIFFDemuxer);
