export declare class Resampler {
    private fromSampleRate;
    private toSampleRate;
    private channels;
    private inputBufferLength;
    private resampler;
    private ratioWeight;
    private lastWeight;
    private outputBuffer;
    private lastOutput;
    private tailExists;
    constructor(fromSampleRate: number, toSampleRate: number, channels: number, inputBufferLength: number);
    private initialize;
    private bypassResampler;
    private compileLinearInterpolationFunction;
    private compileMultiTapFunction;
}
