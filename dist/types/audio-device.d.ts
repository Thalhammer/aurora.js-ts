import { EventHost } from "./core";
import { AudioDeviceBackend } from "./audio-device-backend";
export interface DeviceRegistration {
    new (...args: any[]): AudioDeviceBackend;
    supported: boolean;
}
export declare class AudioDevice extends EventHost {
    private sampleRate;
    private channels;
    private playing;
    private currentTime;
    private _lastTime;
    private _timer;
    private refill;
    private device;
    constructor(sampleRate: number, channels: number);
    start(): void;
    stop(): void;
    destroy(): void;
    seek(cTime: any): void;
    updateTime(): void;
    private static devices;
    static register(device: DeviceRegistration): void;
    static create(sampleRate: number, channels: number): AudioDeviceBackend;
}
