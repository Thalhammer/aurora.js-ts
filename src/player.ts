/*
The Player class plays back audio data from various sources
as decoded by the Asset class.  In addition, it handles
common audio filters like panning and volume adjustment,
and interfacing with AudioDevices to keep track of the
playback time.
*/

import { EventHost } from './core';
import { Asset } from './asset';
import { VolumeFilter, BalanceFilter } from './filters';
import { Queue } from './queue';
import { AudioDevice } from './audio-device';
import { Filter } from './filter';

export class Player extends EventHost {
	public playing = false;
	public volume = 100;
	public pan = 0; // -50 for left, 50 for right, 0 for center
	private buffered = 0;
	private currentTime = 0;
	private duration = 0;
	private metadata: any = {};
	private format: any;
	private queue: Queue;
	private startedPreloading = false;
	private device: AudioDevice = null;
	private refill: any;

	private filters: Filter[] = [
		new VolumeFilter(this, 'volume'),
		new BalanceFilter(this, 'pan')
	];

	constructor(private asset: Asset) {
		super();

		this.asset.on('buffer', (buffered) => {
			this.buffered = buffered;
			this.emit('buffer', this.buffered);
		});

		this.asset.on('decodeStart', () => {
			this.queue = new Queue(this.asset);
			this.queue.once('ready', this.startPlaying.bind(this));
		});
		this.asset.on('format', (format) => {
			this.format = format;
			this.emit('format', this.format);
		});
		this.asset.on('metadata', (metadata) => {
			this.metadata = metadata;
			this.emit('metadata', this.metadata);
		});

		this.asset.on('duration', (duration) => {
			this.duration = duration;
			this.emit('duration', this.duration);
		});

		this.asset.on('error', (error) => {
			this.emit('error', error);
		});
	}

	static fromURL(url, opts) {
		return new Player(Asset.fromURL(url, opts));
	}

	static fromFile(file) {
		return new Player(Asset.fromFile(file));
	}

	static fromBuffer(buffer) {
		return new Player(Asset.fromBuffer(buffer));
	}

	preload() {
		if (!this.asset) {
			return;
		}

		this.startedPreloading = true;
		this.asset.start(false);
	}

	play() {
		if (this.playing) {
			return;
		}

		if (!this.startedPreloading) {
			this.preload();
		}

		this.playing = true;
		if (this.device) {
			this.device.start();
		}
	}

	pause() {
		if (!this.playing) {
			return;
		}

		this.playing = false;
		if (this.device) {
			this.device.stop();
		}
	}

	togglePlayback() {
		if (this.playing) {
			this.pause();
		} else {
			this.play();
		}
	}

	stop() {
		this.pause();
		this.asset.stop();
		if (this.device) {
			this.device.destroy();
		}
	}

	seek(timestamp) {
		if (this.device) {
			this.device.stop();
		}
		this.queue.once('ready', () => {
			if (!this.device) {
				return;
			}
			this.device.seek(this.currentTime);
			if (this.playing) {
				this.device.start();
			}
		});

		// convert timestamp to sample number
		timestamp = (timestamp / 1000) * this.format.sampleRate;

		// the actual timestamp we seeked to may differ
		// from the requested timestamp due to optimizations
		timestamp = this.asset.decoder.seek(timestamp);

		// convert back from samples to milliseconds
		this.currentTime = timestamp / this.format.sampleRate * 1000 | 0;

		this.queue.reset();
		return this.currentTime;
	}

	startPlaying() {
		let frame = this.queue.read();
		let frameOffset = 0;

		this.device = new AudioDevice(this.format.sampleRate, this.format.channelsPerFrame);
		this.device.on('timeUpdate', (currentTime) => {
			this.currentTime = currentTime;
			this.emit('progress', this.currentTime);
		});

		this.refill = (buffer) => {
			if (!this.playing) {
				return;
			}

			// try reading another frame if one isn't already available
			// happens when we play to the end and then seek back
			if (!frame) {
				frame = this.queue.read();
				frameOffset = 0;
			}

			let bufferOffset = 0;
			while (frame && bufferOffset < buffer.length) {
				const max = Math.min(frame.length - frameOffset, buffer.length - bufferOffset);
				for (let i = 0; i < max; i++) {
					buffer[bufferOffset++] = frame[frameOffset++];
				}

				if (frameOffset === frame.length) {
					frame = this.queue.read();
					frameOffset = 0;
				}
			}

			// run any applied filters
			this.filters.forEach((filter) => {
				filter.process(buffer);
			});

			// if we've run out of data, pause the player
			if (!frame) {
				// if this was the end of the track, make
				// sure the currentTime reflects that
				if (this.queue.ended) {
					this.currentTime = this.duration;
					this.emit('progress', this.currentTime);
					this.emit('end');
					this.stop();
				} else {
					// if we ran out of data in the middle of
					// the track, stop the timer but don't change
					// the playback state
					this.device.stop();
				}
			}
		};

		this.device.on('refill', this.refill);
		if (this.playing) {
			this.device.start();
		}
		this.emit('ready');
	}
	destroy() {
		this.stop();
		if (this.device) {
			this.device.off();
		}
		if (this.asset) {
			this.asset.destroy();
		}
		this.off();
	}
}
