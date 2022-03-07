import { EventHost } from './core';

export abstract class AudioDeviceBackend extends EventHost {
	sampleRate: number;
	abstract getDeviceTime(): number;
	abstract destroy();
}
