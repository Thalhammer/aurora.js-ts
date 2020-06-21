import { ISource } from '../source';
import { BufferList, Buffer, EventHost } from '../core';

export class BufferSource extends EventHost implements ISource {
    private list: BufferList;
    private paused: boolean;
    private _timer: any;

    constructor(input: BufferList | Buffer | ArrayBuffer) {
        super();
        if(input instanceof BufferList) {
            this.list = input;
        } else {
            this.list = new BufferList();
            this.list.append(new Buffer(input));
        }

        this.paused = true;
    }

    private setImmediate(fn) {
        if(global.setImmediate) return global.setImmediate(fn);
        else return global.setTimeout(fn, 0);
    }

    private clearImmediate(timer) {
        if(global.clearImmediate) return global.clearImmediate(timer);
        else return global.clearTimeout(timer);
    }

    start() {
        this.paused = false;
        this._timer = this.setImmediate(this.loop.bind(this));
    }

    loop() {
        this.emit("progress", ((this.list.numBuffers - this.list.availableBuffers + 1) / this.list.numBuffers * 100) | 0);
        this.emit("data", this.list.first);
        if(this.list.advance()) this.setImmediate(this.loop.bind(this));
        else this.emit("end");
    }

    pause() {
        this.clearImmediate(this._timer);
        this.paused = true;
    }

    reset() {
        this.pause();
        this.list.rewind();
    }
}