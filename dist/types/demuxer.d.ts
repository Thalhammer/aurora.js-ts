import * as AV from './core';
import { SeekPoint } from './seek-point';
export interface DemuxerRegistration {
    new (...args: any[]): Demuxer;
    probe(buffer: AV.Stream): boolean;
}
export declare abstract class Demuxer extends AV.EventHost {
    private static demuxers;
    stream: AV.Stream;
    seekPoints: SeekPoint[];
    format: any;
    private source;
    constructor(source: AV.EventHost, chunk: AV.Buffer);
    static register(demuxer: DemuxerRegistration): void;
    static find(buffer: AV.Buffer): DemuxerRegistration;
    addSeekPoint(offset: any, timestamp: any): void;
    searchTimestamp(timestamp: number, backward?: boolean): number;
    seek(timestamp: any): SeekPoint;
    abstract init(): any;
    abstract readChunk(): any;
}
