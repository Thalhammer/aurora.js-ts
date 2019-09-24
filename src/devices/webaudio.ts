import { AudioDeviceBackend } from "../audio-device-backend";
import { AudioDevice } from "../audio-device";
import { Resampler } from './resampler';

export class WebAudioDevice extends AudioDeviceBackend {
    static Context = (window as any).AudioContext || (window as any).webkitAudioContext;
    static supported = WebAudioDevice.Context;

    static sharedContext = null;

    private context: AudioContext;
    private deviceSampleRate: number;
    private bufferSize: number;
    private channels: number;
    private resampler: any = null;
    private node: ScriptProcessorNode;

    constructor(sampleRate: number, channels: number) {
        super();

        WebAudioDevice.sharedContext = WebAudioDevice.sharedContext || new WebAudioDevice.Context();

        this.context = WebAudioDevice.sharedContext;
        this.deviceSampleRate = this.context.sampleRate;
        this.sampleRate = sampleRate;
        this.channels = channels;

        this.bufferSize = Math.ceil(4096 / (this.deviceSampleRate / this.sampleRate)*this.channels);
        this.bufferSize += this.bufferSize % this.channels;


        if(this.deviceSampleRate != this.sampleRate)
            this.resampler = new Resampler(this.sampleRate, this.deviceSampleRate, this.channels, this.bufferSize);

        this.node = this.context["createScriptProcessor"](4096, this.channels, this.channels);
        this.node.onaudioprocess = this.refill.bind(this);
        this.node.connect(this.context.destination);
    }

    refill(event: AudioProcessingEvent) {
        let outputBuffer = event.outputBuffer;
        let channelCount = outputBuffer.numberOfChannels;
        let channels = new Array(channelCount);

        for(let i=0; i<channelCount; i++) {
            channels[i] = outputBuffer.getChannelData(i);
        }

        let data = new Float32Array(this.bufferSize);
        this.emit("refill", data);

        if(this.resampler)
            data = this.resampler.resampler(data);
        
        for(let i=0; i<outputBuffer.length; i++) {
            for(let n=0; n<channelCount; n++)
                channels[n][i] = data[i*channelCount + n];
        }
    }

    destroy() {
        this.node.disconnect(0);
    }

    getDeviceTime() : number {
        return this.context.currentTime * this.sampleRate;
    }
};

AudioDevice.register(WebAudioDevice);