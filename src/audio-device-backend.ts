import { EventEmitter } from "./core";

export abstract class AudioDeviceBackend extends EventEmitter {
    abstract getDeviceTime() : number;
    abstract destroy();
    sampleRate : number;
}