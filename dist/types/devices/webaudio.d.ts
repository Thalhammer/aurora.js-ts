import { AudioDeviceBackend } from "../audio-device-backend";
export declare class WebAudioDevice extends AudioDeviceBackend {
    static Context: any;
    static supported: any;
    static sharedContext: any;
    private context;
    private deviceSampleRate;
    private bufferSize;
    private channels;
    private resampler;
    private node;
    constructor(sampleRate: number, channels: number);
    refill(event: AudioProcessingEvent): void;
    destroy(): void;
    getDeviceTime(): number;
}
