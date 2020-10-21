import * as AV from "./core";
import { SeekPoint } from "./seek-point";
export interface DemuxerRegistration {
    new (...args: any[]): Demuxer;
    probe(buffer: AV.Stream): boolean;
}
export declare abstract class Demuxer extends AV.EventHost {
    private source;
    stream: AV.Stream;
    seekPoints: SeekPoint[];
    format: any;
    constructor(source: AV.EventHost, chunk: AV.Buffer);
    abstract init(): any;
    abstract readChunk(): any;
    addSeekPoint(offset: any, timestamp: any): void;
    searchTimestamp(timestamp: number, backward?: boolean): number;
    seek(timestamp: any): SeekPoint;
    private static demuxers;
    static register(demuxer: DemuxerRegistration): void;
    static find(buffer: AV.Buffer): DemuxerRegistration;
}
