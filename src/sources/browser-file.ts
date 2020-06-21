import * as AV from '../core';

export class FileSource extends AV.EventHost {
  private offset: number;
  private length: number;
  private chunkSize: number;
  private reader: FileReader;
  private active: boolean;

  constructor(private file: File | Blob) {
    super();
    if(!FileReader)
      throw new Error("This browser does not have FileReader support");
    this.offset = 0;
    this.length = file.size;
    this.chunkSize = 1 << 20;
    if(!this.file.slice) this.file.slice = this.file["webkitSlice"] || this.file["mozSlice"];
  }

  start() {
    if(this.reader && !this.active)
      return this.loop();
    
    this.reader = new FileReader();
    this.active = true;

    this.reader.onload = (e) => {
      let buf = new AV.Buffer(new Uint8Array((e.target as any).result as ArrayBuffer))
      this.offset += buf.length;
      this.emit('data', buf);   
      this.active = false;   
      if(this.offset < this.length) this.loop();
    };
    this.reader.onloadend = (e) => {
      if(this.offset == this.length) {
        this.emit("end");
        this.reader = null;
      }
    };
    this.reader.onerror = (e) => {
      this.emit("error", e);
    };
    this.reader.onprogress = (e) => {
      this.emit('progress', (this.offset + e.loaded) / this.length * 100);
    };
    this.loop();
  }

  private loop() {
    this.active = true;
    let endPos = Math.min(this.offset + this.chunkSize, this.length);
    let blob = this.file.slice(this.offset, endPos);
    this.reader.readAsArrayBuffer(blob);
  }

  pause() {
    this.active = false;
    try {
      this.reader.abort();
    } catch(e){}
  }

  reset() {
    this.pause();
    this.offset = null;
  }
}
