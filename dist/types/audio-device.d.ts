import { EventHost } from './core';
import { AudioDeviceBackend } from './audio-device-backend';
export interface DeviceRegistration {
    supported: boolean;
    new (...args: any[]): AudioDeviceBackend;
}
export declare class AudioDevice extends EventHost {
    private static devices;
    private sampleRate;
    private channels;
    private playing;
    private currentTime;
    private _lastTime;
    private _timer;
    private refill;
    private device;
    constructor(sampleRate: number, channels: number);
    static register(device: DeviceRegistration): void;
    static create(sampleRate: number, channels: number): AudioDeviceBackend;
    start(): void;
    stop(): void;
    destroy(): void;
    seek(cTime: any): void;
    updateTime(): void;
}
