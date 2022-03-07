/**
 * @jest-environment jsdom
 */
import * as AV from '../../src/';

describe('core/buffer-list', () => {
  it('append', () => {
    let list = new AV.BufferList();
    let buffer = new AV.Buffer(new Uint8Array([1,2,3]));

    list.append(buffer);

    expect(list.numBuffers).toBe(1);
    expect(list.availableBuffers).toBe(1);
    expect(list.availableBytes).toBe(3);
    expect(list.first).toEqual(buffer);
    expect(list.last).toEqual(buffer);
    expect(buffer.prev).toBeNull();
    expect(buffer.next).toBeNull();

    let buffer2 = new AV.Buffer(new Uint8Array([4,5,6]));
    list.append(buffer2);

    expect(list.numBuffers).toBe(2);
    expect(list.availableBuffers).toBe(2);
    expect(list.availableBytes).toBe(6);
    expect(list.first).toEqual(buffer);
    expect(list.last).toEqual(buffer2);
    expect(buffer.prev).toBeNull();
    expect(buffer.next).toEqual(buffer2);
    expect(buffer2.prev).toEqual(buffer);
    expect(buffer2.next).toBeNull();
  });

  it('advance', () => {
    let list = new AV.BufferList();
    let buffer = AV.Buffer.allocate(3);
    let buffer2 = AV.Buffer.allocate(3);
    list.append(buffer);
    list.append(buffer2);

    expect(list.numBuffers).toBe(2);
    expect(list.availableBuffers).toBe(2);
    expect(list.availableBytes).toBe(6);
    expect(list.first).toEqual(buffer);

    expect(list.advance()).toBeTruthy();

    expect(list.numBuffers).toBe(2);
    expect(list.availableBuffers).toBe(1);
    expect(list.availableBytes).toBe(3);
    expect(list.first).toEqual(buffer2);

    expect(list.advance()).toBeFalsy();

    expect(list.numBuffers).toBe(2);
    expect(list.availableBuffers).toBe(0);
    expect(list.availableBytes).toBe(0);
    expect(list.first).toBeNull();
  });

  it('rewind', () => {
    let list = new AV.BufferList();
    let buffer = AV.Buffer.allocate(3);
    let buffer2 = AV.Buffer.allocate(3);
    list.append(buffer);
    list.append(buffer2);

    expect(list.numBuffers).toBe(2);
    expect(list.availableBuffers).toBe(2);
    expect(list.availableBytes).toBe(6);

    expect(list.advance()).toBeTruthy();
    expect(list.numBuffers).toBe(2);
    expect(list.availableBuffers).toBe(1);
    expect(list.availableBytes).toBe(3);
    expect(list.first).toEqual(buffer2);

    expect(list.rewind()).toBeTruthy();
    expect(list.numBuffers).toBe(2);
    expect(list.availableBuffers).toBe(2);
    expect(list.availableBytes).toBe(6);
    expect(list.first).toEqual(buffer);

    // can't rewind anymore so nothing should change
    expect(list.rewind()).toBeFalsy();
    expect(list.numBuffers).toBe(2);
    expect(list.availableBuffers).toBe(2);
    expect(list.availableBytes).toBe(6);
    expect(list.first).toEqual(buffer);

    // advancing past the end of the list and then rewinding should give us the last buffer
    expect(list.advance()).toBeTruthy();
    expect(list.advance()).toBeFalsy();
    expect(list.numBuffers).toBe(2);
    expect(list.availableBuffers).toBe(0);
    expect(list.availableBytes).toBe(0);
    expect(list.first).toBeNull();

    expect(list.rewind()).toBeTruthy();
    expect(list.numBuffers).toBe(2);
    expect(list.availableBuffers).toBe(1);
    expect(list.availableBytes).toBe(3);
    expect(list.first).toEqual(buffer2);
  });

  it('reset', () => {
    let list = new AV.BufferList();
    let buffer = AV.Buffer.allocate(3);
    let buffer2 = AV.Buffer.allocate(3);
    let buffer3 = AV.Buffer.allocate(3);
    list.append(buffer);
    list.append(buffer2);
    list.append(buffer3);

    expect(list.numBuffers).toBe(3);
    expect(list.availableBuffers).toBe(3);
    expect(list.availableBytes).toBe(9);

    expect(list.advance()).toBeTruthy();
    expect(list.numBuffers).toBe(3);
    expect(list.availableBuffers).toBe(2);
    expect(list.availableBytes).toBe(6);
    expect(list.first).toEqual(buffer2);

    expect(list.advance()).toBeTruthy();
    expect(list.numBuffers).toBe(3);
    expect(list.availableBuffers).toBe(1);
    expect(list.availableBytes).toBe(3);
    expect(list.first).toEqual(buffer3);

    list.reset();
    expect(list.first).toEqual(buffer);
    expect(list.numBuffers).toBe(3);
    expect(list.availableBuffers).toBe(3);
    expect(list.availableBytes).toBe(9);
  });

  it('copy', () => {
    let list = new AV.BufferList();
    let buffer = AV.Buffer.allocate(3);
    list.append(buffer);

    let copy = list.copy();

    expect(copy.numBuffers).toBe(1);
    expect(list.numBuffers).toBe(1);
    expect(copy.availableBuffers).toEqual(list.availableBuffers);
    expect(copy.availableBytes).toEqual(list.availableBytes);
    expect(copy.first).toEqual(list.first);
  });
});
