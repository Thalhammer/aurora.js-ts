import * as AV from '../core';

export class HTTPSource extends AV.EventHost {
  private chunkSize: number;
  private inflight: boolean;
  private length: number;
  private xhr: XMLHttpRequest;
  private offset: number;

  constructor(private file, private opts?: any) {
    super();
    if (!this.opts) this.opts = {};
    this.chunkSize = 1 << 20;
    this.inflight = false;
    if (this.opts.length)
      this.length = this.opts.length;
    this.reset();
  }

  start() {
    if (this.length && !this.inflight)
      return this.loop();
    this.inflight = true;
    this.xhr = new XMLHttpRequest();
    this.xhr.onload = (event) => {
      this.length = parseInt(this.xhr.getResponseHeader("Content-Length"));
      this.inflight = false;
      this.loop();
    };
    this.xhr.onerror = (err) => {
      this.pause();
      this.emit("error", err);
    };
    this.xhr.onabort = () => {
      this.inflight = false;
    };
    this.xhr.open("HEAD", this.file, true);
    this.xhr.send(null);
  }

  private loop() {
    if (this.inflight || !this.length)
      return this.emit("error", 'Something is wrong in HTTPSource.loop');
    this.inflight = true;
    this.xhr = new XMLHttpRequest();
    this.xhr.onload = (event) => {
      let buf: Uint8Array;
      if (this.xhr.response) buf = new Uint8Array(this.xhr.response);
      else {
        let txt = this.xhr.responseText;
        buf = new Uint8Array(txt.length);
        for (let i = 0; i < txt.length; i++) buf[i] = txt.charCodeAt(i) & 0xff;
      }

      let buffer = new AV.Buffer(buf);
      this.offset += buffer.length;
      this.emit("data", buffer);
      if (this.offset >= this.length) this.emit("end");

      this.inflight = false;
      if (this.offset < this.length) this.loop();
    };
    this.xhr.onprogress = (event) => {
      this.emit("progress", (this.offset + event.loaded) / this.length * 100);
    };
    this.xhr.onerror = (err) => {
      this.emit("error", err);
      this.pause();
    }
    this.xhr.onabort = () => { this.inflight = false; }

    this.xhr.open("GET", this.file, true);
    this.xhr.responseType = "arraybuffer";

    let endPos = Math.min(this.offset + this.chunkSize, this.length - 1);
    this.xhr.setRequestHeader("If-None-Match", "webkit-no-cache")
    this.xhr.setRequestHeader("Range", "bytes=" + this.offset + "-" + endPos)
    this.xhr.overrideMimeType('text/plain; charset=x-user-defined')
    this.xhr.send(null);
  }

  pause() {
    this.inflight = false;
    if (this.xhr) this.xhr.abort();
  }

  private reset() {
    this.pause();
    this.offset = 0;
  }
}
