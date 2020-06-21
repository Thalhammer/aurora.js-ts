import { EventHost } from "./core";

export abstract class AudioDeviceBackend extends EventHost {
    abstract getDeviceTime() : number;
    abstract destroy();
    sampleRate : number;
}