/**
 * @jest-environment jsdom
 */
import * as AV from '../../src/core/';

describe('core/buffer', () => {
  let bytes = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  let buffer = new AV.Buffer(bytes);

  it('length', () => {
    expect(buffer.length).toBe(10);
  });

  it('allocate', () => {
    let buf = AV.Buffer.allocate(10);
    expect(buf.length).toBe(10);
    expect(buf.data instanceof Uint8Array).toBeTruthy();
    expect(buf.data.length).toBe(10);
  });

  it('copy', () => {
    let copy = buffer.copy();
    expect(copy.length).toBe(buffer.length);
    expect(copy.data).not.toBe(buffer.data);
    expect(buffer.data.length).toBe(copy.data.length);
  });

  it('slice', () => {
    expect(buffer.slice(0,4).length).toBe(4);
    expect(buffer.slice(0, 100).data).toEqual(bytes);
    expect(new AV.Buffer(bytes.subarray(3,6))).toEqual(buffer.slice(3,3));
    expect(buffer.slice(5).length).toBe(5);
  });

  it('create from ArrayBuffer', () => {
    let buf = new AV.Buffer(new ArrayBuffer(9));
    expect(buf.length).toBe(9);
    expect(buf.data).toBeInstanceOf(Uint8Array);
    expect(buf.data.length).toBe(9);
    expect(new AV.Buffer(new Uint8Array(9))).toEqual(buf);
  });

  it('create from typed Array', () => {
    let buf = new AV.Buffer(new Uint32Array(9));
    expect(buf.length).toBe(36);
    expect(buf.data).toBeInstanceOf(Uint8Array);
    expect(buf.data.length).toBe(36);
    expect(new AV.Buffer(new Uint8Array(36))).toEqual(buf);
  });

  it('create from sliced typed array', () => {
    let buf = new AV.Buffer(new Uint32Array(9).subarray(2, 6));
    expect(buf.length).toBe(16);
    expect(buf.data).toBeInstanceOf(Uint8Array);
    expect(buf.data.length).toBe(16);
    expect(new AV.Buffer(new Uint8Array(new ArrayBuffer(36), 8,16))).toEqual(buf);
  });

  it('create from array', () => {
    let buf = new AV.Buffer([1,2,3,4,5,6,7,8,9]);
    expect(buf.length).toBe(9);
    expect(buf.data).toBeInstanceOf(Uint8Array);
    expect(buf.data.length).toBe(9);
    expect(new AV.Buffer(new Uint8Array([1,2,3,4,5,6,7,8,9]))).toEqual(buf);
  });

  it('create from number', () => {
    let buf = new AV.Buffer(9);
    expect(buf.length).toBe(9);
    expect(buf.data).toBeInstanceOf(Uint8Array);
    expect(buf.data.length).toBe(9);
    expect(new AV.Buffer(new Uint8Array(9))).toEqual(buf);
  });

  it('create from another AV.Buffer', () => {
    let buf = new AV.Buffer(new AV.Buffer(9));
    expect(buf.length).toBe(9);
    expect(buf.data).toBeInstanceOf(Uint8Array);
    expect(buf.data.length).toBe(9);
    expect(new AV.Buffer(new Uint8Array(9))).toEqual(buf);
  });

  it('error constructing', () => {
    expect(()=>{new AV.Buffer('string')}).toThrow();
    expect(()=>{new AV.Buffer(true)}).toThrow();
  });

  if(false && Blob) {  // createBlobURL is not supported by jest
    it("makeBlob", () => {
      expect(AV.Buffer.makeBlob(bytes)).toBeInstanceOf(Blob);
    });
    it("makeBlobURL", () => {
      expect(typeof AV.Buffer.makeBlobURL(bytes) === 'string').toBeTruthy();
    });
    it("toBlob", () => {
      expect(new AV.Buffer(bytes).toBlob()).toBeInstanceOf(Blob);
    });
    it("toBlobURL", () => {
      expect(typeof new AV.Buffer(bytes).toBlobURL() === 'string').toBeTruthy();
    });
  }
});
