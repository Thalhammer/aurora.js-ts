import { EventHost } from './core';
export declare abstract class AudioDeviceBackend extends EventHost {
    sampleRate: number;
    abstract getDeviceTime(): number;
    abstract destroy(): any;
}
