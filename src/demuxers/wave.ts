import { Demuxer } from "../demuxer";
import { Buffer, Stream } from '../core';

export class WAVEDemuxer extends Demuxer {
    static probe(stream: Stream) : boolean {
        return stream.peekString(0,4) === "RIFF" && stream.peekString(8, 4) === "WAVE";
    }

    static formats: {[idx:number]:string} = {
        0x0001: 'lpcm',
        0x0003: 'lpcm',
        0x0006: 'alaw',
        0x0007: 'ulaw'
    };

    private fileSize: number;
    private readStart: boolean;
    private readHeaders: boolean;
    private type: string;
    private len: number;
    private sentDuration: boolean;

    init() {
    }

    readChunk() {
        if(!this.readStart && this.stream.available(12)) {
            if(this.stream.readString(4) != "RIFF")
                return this.emit("error", "Invalid WAV file.");
            this.fileSize = this.stream.readUInt32(true);
            this.readStart = true;

            if(this.stream.readString(4) != "WAVE")
                return this.emit("error", "Invalid WAV file.");
        }
        while(this.stream.available(1)) {
            if(!this.readHeaders && this.stream.available(8)) {
                this.type = this.stream.readString(4);
                this.len = this.stream.readUInt32(true);
            }
            switch(this.type) {
                case "fmt ":
                    let encoding = this.stream.readUInt16(true);
                    if(!WAVEDemuxer.formats[encoding]) return this.emit("error", "Unsupported format in WAV file.");
                    this.format = {
                        formatID: WAVEDemuxer.formats[encoding],
                        floatingPoint: encoding == 0x0003,
                        littleEndian: WAVEDemuxer.formats[encoding] == "lpcm",
                        channelsPerFrame: this.stream.readUInt16(true),
                        sampleRate: this.stream.readUInt32(true),
                        framesPerPacket: 1
                    };
                    this.stream.advance(4); // bytes/sec
                    this.stream.advance(2); // block align

                    this.format.bitsPerChannel = this.stream.readUInt16(true);
                    this.format.bytesPerPacket = (this.format.bitsPerChannel/8) * this.format.channelsPerFrame;

                    this.emit("format", this.format);
                    this.stream.advance(this.len - 16);
                    break;
                case "data":
                    if(!this.sentDuration) {
                        let bytes = this.format.bitsPerChannel/8;
                        this.emit("duration", this.len / bytes / this.format.channelsPerFrame / this.format.sampleRate*1000 | 0);
                        this.sentDuration = true;
                    }

                    let buffer = this.stream.readSingleBuffer(this.len);
                    this.len -= buffer.length;
                    this.readHeaders = this.len > 0;
                    this.emit("data", buffer);
                    break;
                default:
                    if(!this.stream.available(this.len)) return;
                    this.stream.advance(this.len);
                    break;
            }
            if(this.type !="data") this.readHeaders = false;
        }
    }
};

Demuxer.register(WAVEDemuxer);