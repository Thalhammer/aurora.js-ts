import * as AV from '../core';
import * as http from 'http';

export class HTTPSource extends AV.EventHost {
  private request: http.ClientRequest;
  private response: http.ClientResponse;
  private loaded;
  private size;

  constructor(private url: string, private opts?: any) {
    super();
    this.request = null;
    this.response = null;
    this.loaded = 0;
    this.size = 0;
  }

  start() {
    if (this.response) return this.response.resume();

    this.request = http.get(this.url);
    this.request.on("response", (resp) => {
      this.response = resp;
      if (this.response.statusCode != 200) {
        return this.errorHandler('Error loading file. HTTP status code ' + this.response.statusCode);
      }

      this.size = parseInt(this.response.headers['content-length'] as string);
      this.loaded = 0;

      this.response.on("data", (chunk) => {
        this.loaded += chunk.length;
        this.emit('progress', this.loaded / this.size * 100);
        this.emit('data', new AV.Buffer(new Uint8Array(chunk as Buffer)));
      });
      this.response.on("end", () => {
        this.emit("end");
      });
      this.response.on("error", this.errorHandler.bind(this));
    });
    this.request.on("error", this.errorHandler.bind(this));
  }

  pause() {
    if (this.response) this.response.pause();
  }

  private reset() {
    this.pause();
    this.request.abort();
    this.request = null;
    this.response = null;
  }

  private errorHandler(error: string) {
    this.reset();
    this.emit("error", error);
  }
}