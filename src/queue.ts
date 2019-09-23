import { EventEmitter } from "./core"
import { Asset } from "./asset";

export class Queue extends EventEmitter {
    private readMark: number = 64;
    private finished: boolean = false;
    private buffering: boolean = true;
    public ended: boolean = false;
    private buffers: any[] = [];

    private asset: Asset;

    constructor(asset: Asset) {
        super();
        this.asset = asset;

        this.asset.on("data", this.write.bind(this));
        this.asset.on("end", () => {
            this.ended = true;
        });
        this.asset.decodePacket();
    }

    write(buffer) {
        if(buffer) this.buffers.push(buffer);

        if(this.buffering) {
            if(this.buffers.length >= this.readMark || this.ended) {
                this.buffering = false;
                this.emit("ready");
            } else {
                this.asset.decodePacket();
            }
        }
    }

    read() {
        if(this.buffers.length == 0) return null;
        this.asset.decodePacket();
        return this.buffers.shift();
    }

    reset() {
        this.buffers.length = 0;
        this.buffering = true;
        this.asset.decodePacket();
    }
};