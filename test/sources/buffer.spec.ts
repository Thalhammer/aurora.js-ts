/**
 * @jest-environment jsdom
 */
import * as AV from '../../src/';
import { CRC32 } from '../crc32';
import { config } from '../config';

describe('sources/buffer', () => {
	let buffer: Uint8Array = null;

	let getData = (fn) => {
		if (buffer) return fn();

		// if we're in Node, we can read any file we like, otherwise simulate by reading
		// a blob from an XHR and loading it using a FileSource
		if (global.Buffer) {
			require('fs').readFile(__dirname + "/../data/m4a/base.m4a", (err, data) => {
				expect(err).toBe(null);
				expect(data).toBeInstanceOf(Buffer);
				buffer = new Uint8Array(data);
				fn();
			});
		} else {
			let xhr = new XMLHttpRequest();
			xhr.open('GET', config.HTTP_BASE + "/data/m4a/base.m4a");
			xhr.responseType = 'arraybuffer';
			xhr.send();
			xhr.onload = () => {
				let x = new ArrayBuffer(xhr.response.byteLength);
				buffer = new Uint8Array(x);
				buffer.set(new Uint8Array(xhr.response));
				fn();
			};
		}
	};

	it('single AV.Buffer', (done) => {
		getData(() => {
			let crc = new CRC32();
			let source = new AV.BufferSource(new AV.Buffer(buffer));

			source.on("data", (chunk) => {
				expect(chunk).toBeInstanceOf(AV.Buffer);
				crc.update(chunk);
			});
			source.on("progress", (progress) => {
				expect(progress).toBe(100);
			})
			source.on("end", () => {
				expect(crc.toHex()).toBe("84d9f967");
				done();
			});
			source.start();
		});
	});

	it('single Uint8Array', (done) => {
		getData(() => {
			let crc = new CRC32();
			let source = new AV.BufferSource(buffer);

			source.on("data", (chunk) => {
				expect(chunk).toBeInstanceOf(AV.Buffer);
				crc.update(chunk);
			});
			source.on("progress", (progress) => {
				expect(progress).toBe(100);
			})
			source.on("end", () => {
				expect(crc.toHex()).toBe("84d9f967");
				done();
			});
			source.start();
		});
	});

	it('single ArrayBuffer', (done) => {
		getData(() => {
			let crc = new CRC32();
			let source = new AV.BufferSource(buffer.buffer);
			source.on("data", (chunk) => {
				expect(chunk).toBeInstanceOf(AV.Buffer);
				crc.update(chunk);
			});
			source.on("progress", (progress) => {
				expect(progress).toBe(100);
			})
			source.on("end", () => {
				expect(crc.toHex()).toBe("84d9f967");
				done();
			});
			source.start();
		});
	});

	it('AV.BufferList', (done) => {
		getData(() => {
			let list = new AV.BufferList();
			let buffers = [
				new AV.Buffer(buffer),
				new AV.Buffer(buffer),
				new AV.Buffer(buffer),
			];

			list.append(buffers[0]);
			list.append(buffers[1]);
			list.append(buffers[2]);

			let source = new AV.BufferSource(list);

			let count = 0;
			source.on('data', (chunk) => {
				expect(chunk).toBe(buffers[count++]);
			});

			let pcount = 0;
			source.on('progress', (progress) => {
				expect(progress).toBe(++pcount / 3 * 100 | 0);
			});
			source.on('end', () => {
				expect(count).toBe(3);
				done();
			});

			source.start();
		});
	});
});
