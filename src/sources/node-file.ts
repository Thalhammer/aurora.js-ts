import * as fs from 'fs';
import * as AV from '../core';

export class FileSource extends AV.EventEmitter {
    private stream: fs.ReadStream;
    private loaded: number;
    private size: number;
    constructor(private filename: string) {
      super();
      this.stream = null;
      this.loaded = null;
      this.size = null;
    }
  
    private getSize() {
      fs.stat(this.filename, (err, stat) => {
        if (err) return this.emit("error", err);
        this.size = stat.size;
        this.start();
      });
    }
  
    start() {
      if (!this.size) {
        return this.getSize();
      }
      if (this.stream) return this.stream.resume();
  
      this.stream = fs.createReadStream(this.filename);
  
      // TODO: Buffering somehow breaks our data, pass it straight through for now
      this.stream.on("data", (buf : Buffer) => {
        this.loaded += buf.length;
        this.emit("progress", this.loaded / this.size * 100);
        this.emit("data", new AV.Buffer(new Uint8Array(buf)));
      });
      
      // comment start
      let b = Buffer.alloc(1 << 20);
      let blen = 0;
      this.stream.on("data", (buf : Buffer) => {
        this.loaded += buf.length;
        buf.copy(b, blen);
        blen += buf.length;
  
        this.emit("progress", this.loaded / this.size * 100);
  
        if(blen >= b.length || this.loaded >= this.size) {
          if(blen < b.length) {
            b = b.slice(0, blen);
          }
  
          this.emit("data", new AV.Buffer(new Uint8Array(b)));
          blen -= b.length;
          buf.copy(b, 0, blen);
          blen = buf.length - blen;
        }
      });
      // comment end
  
  
      this.stream.on("end", ()=>{
        this.emit("end");
      });
  
      this.stream.on("error", (err)=>{
        this.pause();
        this.emit("error", err);
      });
    }
  
    pause() {
      if(this.stream) this.stream.pause();
    }
  }