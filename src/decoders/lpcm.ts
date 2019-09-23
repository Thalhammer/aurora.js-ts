import { Decoder } from '../decoder';

export class LPCMDecoder extends Decoder {
  init() {}
  setCookie(cookie: any) {}
  readChunk() {
    let stream = this.stream;
    let littleEndian = this.format.littleEndian;
    let chunkSize = Math.min(4096, stream.remainingBytes());
    let samples = chunkSize / (this.format.bitsPerChannel / 8) | 0;

    let output: Float32Array | Float64Array | Int8Array | Int16Array | Int32Array = null;

    if (chunkSize < this.format.bitsPerChannel / 8) return null;

    if (this.format.floatingPoint) {
      switch (this.format.bitsPerChannel) {
        case 32:
          output = new Float32Array(samples);
          for (let i = 0; i < samples; i++)
            output[i] = stream.readFloat32(littleEndian);
          break;
        case 64:
          output = new Float64Array(samples);
          for (let i = 0; i < samples; i++)
            output[i] = stream.readFloat64(littleEndian);
          break;
        default:
          throw new Error('Unsupported bit depth.');
      }
    } else {
      switch (this.format.bitsPerChannel) {
        case 8:
          output = new Int8Array(samples);
          for (let i = 0; i < samples; i++)
            output[i] = stream.readInt8();
          break;
        case 16:
          output = new Int16Array(samples);
          for (let i = 0; i < samples; i++)
            output[i] = stream.readInt16(littleEndian);
          break;
        case 24:
          output = new Int32Array(samples);
          for (let i = 0; i < samples; i++)
            output[i] = stream.readInt24(littleEndian);
          break;
        case 32:
          output = new Int32Array(samples);
          for (let i = 0; i < samples; i++)
            output[i] = stream.readInt32(littleEndian);
          break;
        default:
          throw new Error('Unsupported bit depth.');
      }
    }

    return output;
  }
};

Decoder.register("lpcm", LPCMDecoder);