import * as AV from "./core"
import { SeekPoint } from "./seek-point";

export interface DemuxerRegistration {
    new (...args: any[]): Demuxer;
    probe(buffer: AV.Stream): boolean;
}

export abstract class Demuxer extends AV.EventEmitter {
    private source: AV.EventEmitter;
    protected stream: AV.Stream;
    private seekPoints: SeekPoint[];
    protected format: any;

    constructor(source: AV.EventEmitter, chunk: AV.Buffer) {
        super();
        let list = new AV.BufferList();
        list.append(chunk);
        this.stream = new AV.Stream(list);
        this.source = source;

        let received = false;
        this.source.on("data", (chunk) => {
            received = true;
            list.append(chunk);
            try {
                this.readChunk(chunk);
            } catch(e) {
                this.emit("error", e);
            }
        });
        this.source.on("error", (err) => {
            this.emit("error", err);
        });
        this.source.on("end", () => {
            if(received) this.readChunk(chunk);
            this.emit("end");
        });
        this.seekPoints = [];
        this.init();
    }

    abstract init();
    abstract readChunk(chunk: AV.Buffer);

    addSeekPoint(offset, timestamp) {
        let index = this.searchTimestamp(timestamp);
        this.seekPoints.splice(index, 0, new SeekPoint(offset, timestamp));
    }

    searchTimestamp(timestamp: number, backward? :boolean) {
        let low = 0;
        let high = this.seekPoints.length;

        if(high > 0 && this.seekPoints[high - 1].timestamp < timestamp)
            return high;
        
        while(low < high) {
            let mid = (low + high) >> 1;
            let time = this.seekPoints[mid].timestamp;

            if(time < timestamp)
                low = mid + 1;
            else if(time >= timestamp)
                high = mid;
        }

        if(high > this.seekPoints.length)
            high = this.seekPoints.length;
        
        return high;
    }

    seek(timestamp) : SeekPoint {
        if(this.format && this.format.framesPerPacket > 0 && this.format.bytesPerPacket > 0) {
            return new SeekPoint(this.format.bytesPerPacket * timestamp / this.format.framesPerPacket, timestamp);
        } else {
            let idx = this.searchTimestamp(timestamp);
            return this.seekPoints[idx];
        }
    }

    private static demuxers : DemuxerRegistration[] = [];

    static register(demuxer: DemuxerRegistration) {
        this.demuxers.push(demuxer);
    }

    static find(buffer: AV.Buffer) {
        let stream = AV.Stream.fromBuffer(buffer);
        for (const format of this.demuxers) {
            let offset = stream.offset;
            try {
                if(format.probe(stream)) return format;
            } catch(e){}

            stream.seek(offset);
        }
        return null;
    }
}