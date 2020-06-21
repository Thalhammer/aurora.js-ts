import { EventHost } from "./core";
import { AudioDeviceBackend } from "./audio-device-backend";

export interface DeviceRegistration {
    new (...args: any[]): AudioDeviceBackend;
    supported: boolean;
}

export class AudioDevice extends EventHost {
    private sampleRate: number;
    private channels: number;
    private playing: boolean;
    private currentTime: number;
    private _lastTime: number;

    private _timer: any;
    private refill: any;
    private device: AudioDeviceBackend;

    constructor(sampleRate: number, channels: number) {
        super();
        this.sampleRate = sampleRate;
        this.channels = channels;
        this.playing = false;
        this.currentTime = 0;
        this._lastTime = 0;
    }

    start() {
        if(this.playing) return;
        this.playing = true;

        if(!this.device) this.device = AudioDevice.create(this.sampleRate, this.channels);
        if(!this.device) throw new Error("No supported audio device found.");

        this._lastTime = this.device.getDeviceTime();
        this._timer = setInterval(this.updateTime.bind(this), 200);

        this.refill = (buffer: Buffer) => {
            this.emit("refill", buffer);
        };

        this.device.on("refill", this.refill);
    }

    stop() {
        if(!this.playing) return;
        this.playing = false;

        if(this.device) this.device.off("refill", this.refill);
        clearInterval(this._timer);
    }

    destroy() {
        this.stop();
        if(this.device) this.device.destroy();
    }

    seek(cTime) {
        this.currentTime = cTime;
        if(this.playing) this._lastTime = this.device.getDeviceTime();
        this.emit("timeUpdate", this.currentTime);
    }

    updateTime() {
        let time = this.device.getDeviceTime();
        this.currentTime += (time-this._lastTime) / this.device.sampleRate * 1000 | 0;
        this._lastTime = time;
        this.emit("timeUpdate", this.currentTime);
    }

    private static devices : DeviceRegistration[] = [];

    static register(device: DeviceRegistration) {
        this.devices.push(device);
    }

    static create(sampleRate: number, channels: number) {
        for(let device of this.devices) {
            if(device.supported) return new device(sampleRate, channels);
        }
        return null;
    }
}