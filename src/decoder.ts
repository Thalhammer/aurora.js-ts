import { EventHost, Stream, Bitstream, BufferList, Buffer, UnderflowError } from "./core";
import { Demuxer } from "./demuxer";

export interface DecoderRegistration {
    new (demuxer: Demuxer, format): Decoder;
}

export abstract class Decoder extends EventHost {
    protected stream: Stream;
    protected bitstream: Bitstream;
    private receivedFinalBuffer: boolean;
    private waiting: boolean;
    protected demuxer: Demuxer;
    protected format: any;
    
    constructor(demuxer: any, format: any) {
        super();
        this.demuxer = demuxer;
        this.format = format;
        let list = new BufferList();
        this.stream = new Stream(list);
        this.bitstream = new Bitstream(this.stream);
        
        this.receivedFinalBuffer = false;
        this.waiting = false;

        this.demuxer.on("cookie", (cookie) => {
            try {
                this.setCookie(cookie);
            } catch(error) {
                this.emit("error", error);
            }
        });
        this.demuxer.on("data", (chunk: Buffer) => {
            list.append(chunk);
            if(this.waiting) this.decode();
        });
        this.demuxer.on("end", () => {
            this.receivedFinalBuffer = true;
            if(this.waiting) this.decode();
        });

        this.init();
    }

    abstract init();

    abstract setCookie(cookie);

    abstract readChunk();

    decode() {
        this.waiting = !this.receivedFinalBuffer;
        let offset = this.bitstream.offset();

        let packet;
        try {
            packet = this.readChunk();
        } catch(error) {
            if(!(error instanceof UnderflowError)) {
                this.emit("error", error);
                return false;
            }
        }

        if(packet) {
            this.emit("data", packet);
            if(this.receivedFinalBuffer) this.emit("end");
            return true;
        } else if(!this.receivedFinalBuffer) {
            this.bitstream.seek(offset);
            this.waiting = true;
        } else {
            this.emit("end");
        }
        return false;
    }

    seek(timestamp) {
        let seekPoint = this.demuxer.seek(timestamp);
        this.stream.seek(seekPoint.offset);
        return seekPoint.timestamp;
    }

    private static codecs : { [index:string] : DecoderRegistration } = {};

    static register(id: string, decoder: DecoderRegistration) {
        this.codecs[id] = decoder;
    }

    static find(id: string) : DecoderRegistration {
        return this.codecs[id] || null;
    }
}