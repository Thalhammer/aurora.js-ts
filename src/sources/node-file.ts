import * as fs from 'fs';
import * as AV from '../core';

export class FileSource extends AV.EventHost {
	private stream: fs.ReadStream;
	private loaded: number;
	private size: number;

	constructor(private filename: string) {
		super();
		this.stream = null;
		this.loaded = null;
		this.size = null;
	}

	start() {
		if (!this.size) {
			return this.getSize();
		}
		if (this.stream) {
			return this.stream.resume();
		}

		this.stream = fs.createReadStream(this.filename);

		this.stream.on('data', (buf: Buffer) => {
			this.loaded += buf.length;
			this.emit('progress', this.loaded / this.size * 100);
			this.emit('data', new AV.Buffer(new Uint8Array(buf)));
		});

		this.stream.on('end', () => {
			this.emit('end');
		});

		this.stream.on('error', (err) => {
			this.pause();
			this.emit('error', err);
		});
	}

	pause() {
		if (this.stream) {
			this.stream.pause();
		}
	}

	private getSize() {
		fs.stat(this.filename, (err, stat) => {
			if (err) {
				return this.emit('error', err);
			}
			this.size = stat.size;
			this.start();
		});
	}
}
