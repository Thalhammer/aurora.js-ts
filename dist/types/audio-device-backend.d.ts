import { EventHost } from "./core";
export declare abstract class AudioDeviceBackend extends EventHost {
    abstract getDeviceTime(): number;
    abstract destroy(): any;
    sampleRate: number;
}
