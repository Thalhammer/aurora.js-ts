import { Demuxer } from '../demuxer';

export class AUDemuxer extends Demuxer {
	static readonly bps = {
		0: 8,
		1: 8,
		2: 16,
		3: 24,
		4: 32,
		5: 32,
		6: 64,
		26: 8
	};

	static readonly formats = {
		1: 'ulaw',
		27: 'alaw'
	};

	private readHeader: boolean;

	static probe(buffer) {
		return (buffer.peekString(0, 4) === '.snd');
	}

	init() {
	}

	readChunk() {
		if (!this.readHeader && this.stream.available(24)) {
			if (this.stream.readString(4) !== '.snd') {
				return this.emit('error', 'Invalid AU file.');
			}

			const size = this.stream.readUInt32();
			const dataSize = this.stream.readUInt32();
			const encoding = this.stream.readUInt32();

			this.format = {
				formatID: AUDemuxer.formats[encoding] || 'lpcm',
				littleEndian: false,
				floatingPoint: encoding === 6 || encoding === 7,
				bitsPerChannel: AUDemuxer.bps[encoding - 1],
				sampleRate: this.stream.readUInt32(),
				channelsPerFrame: this.stream.readUInt32(),
				framesPerPacket: 1
			};

			if (!this.format.bitsPerChannel) {
				return this.emit('error', 'Unsupported encoding in AU file.');
			}

			this.format.bytesPerPacket = (this.format.bitsPerChannel / 8) * this.format.channelsPerFrame;

			if (dataSize !== 0xffffffff) {
				const bytes = this.format.bitsPerChannel / 8;
				this.emit('duration', dataSize / bytes / this.format.channelsPerFrame / this.format.sampleRate * 1000 | 0);
			}

			this.emit('format', this.format);
			this.readHeader = true;
		}
		if (this.readHeader) {
			while (this.stream.available(1)) {
				this.emit('data', this.stream.readSingleBuffer(this.stream.remainingBytes()));
			}
		}
	}
}
Demuxer.register(AUDemuxer);
