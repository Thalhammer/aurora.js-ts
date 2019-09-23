import * as AV from '../../src/core/';

describe('core/bitstream', () => {
  let makeBitstream = (bytesIn) => {
    let bytes = new Uint8Array(bytesIn);
    let stream = AV.Stream.fromBuffer(new AV.Buffer(bytes));
    return new AV.Bitstream(stream);
  }

  it("copy", () => {
    let bitstream = makeBitstream([10, 160]);
    let copy = bitstream.copy();

    expect(copy).not.toBe(bitstream);
    expect(copy).toEqual(bitstream);
  });

  it("advance", () => {
    let bitstream = makeBitstream([10, 160]);

    expect(bitstream.bitPosition).toBe(0);
    expect(bitstream.offset()).toBe(0);

    bitstream.advance(2);
    expect(bitstream.bitPosition).toBe(2);
    expect(bitstream.offset()).toBe(2);

    bitstream.advance(7);
    expect(bitstream.bitPosition).toBe(1);
    expect(bitstream.offset()).toBe(9);

    expect(() => { bitstream.advance(40); }).toThrowError(AV.UnderflowError);
  });

  it("rewind", () => {
    let bitstream = makeBitstream([10, 160]);

    expect(bitstream.bitPosition).toBe(0);
    expect(bitstream.offset()).toBe(0);

    bitstream.advance(2);
    expect(bitstream.bitPosition).toBe(2);
    expect(bitstream.offset()).toBe(2);

    bitstream.rewind(2);
    expect(bitstream.bitPosition).toBe(0);
    expect(bitstream.offset()).toBe(0);

    bitstream.advance(10);
    expect(bitstream.bitPosition).toBe(2);
    expect(bitstream.offset()).toBe(10);

    bitstream.rewind(4);
    expect(bitstream.bitPosition).toBe(6);
    expect(bitstream.offset()).toBe(6);

    expect(() => { bitstream.rewind(10); }).toThrowError(AV.UnderflowError);
  });

  it("seek", () => {
    let bitstream = makeBitstream([10, 160]);

    expect(bitstream.bitPosition).toBe(0);
    expect(bitstream.offset()).toBe(0);

    bitstream.seek(3);
    expect(bitstream.bitPosition).toBe(3);
    expect(bitstream.offset()).toBe(3);

    bitstream.seek(10);
    expect(bitstream.bitPosition).toBe(2);
    expect(bitstream.offset()).toBe(10);

    bitstream.seek(4);
    expect(bitstream.bitPosition).toBe(4);
    expect(bitstream.offset()).toBe(4);

    expect(() => { bitstream.seek(100); }).toThrowError(AV.UnderflowError);
    expect(() => { bitstream.seek(-10); }).toThrowError(AV.UnderflowError);
  });

  it("align", () => {
    let bitstream = makeBitstream([10, 160]);

    expect(bitstream.bitPosition).toBe(0);
    expect(bitstream.offset()).toBe(0);

    bitstream.align();
    expect(bitstream.bitPosition).toBe(0);
    expect(bitstream.offset()).toBe(0);

    bitstream.seek(2);
    bitstream.align();
    expect(bitstream.bitPosition).toBe(0);
    expect(bitstream.offset()).toBe(8);
  });

  it("read/peek unsigned", () => {
    // 0101 1101 0110 1111 1010 1110 1100 1000 -> 0x5d6faec8
    // 0111 0000 1001 1010 0010 0101 1111 0011 -> 0x709a25f3
    let bitstream = makeBitstream([0x5d, 0x6f, 0xae, 0xc8, 0x70, 0x9a, 0x25, 0xf3]);


    expect(bitstream.peek(2)).toBe(1);
    expect(bitstream.read(2)).toBe(1);

    expect(bitstream.peek(4)).toBe(7);
    expect(bitstream.read(4)).toBe(7);

    expect(bitstream.peek(10)).toBe(0x16f);
    expect(bitstream.read(10)).toBe(0x16f);

    expect(bitstream.peek(16)).toBe(0xaec8);
    expect(bitstream.read(16)).toBe(0xaec8);

    expect(bitstream.peek(32)).toBe(0x709a25f3);
    expect(bitstream.peek(31)).toBe(0x384d12f9);
    expect(bitstream.read(31)).toBe(0x384d12f9);

    expect(bitstream.peek(1)).toBe(1);
    expect(bitstream.read(1)).toBe(1);

    bitstream = makeBitstream([0x5d, 0x6f, 0xae, 0xc8, 0x70]);
    expect(bitstream.peek(40)).toBe(0x5d6faec870);
    expect(bitstream.read(40)).toBe(0x5d6faec870);

    bitstream = makeBitstream([0x5d, 0x6f, 0xae, 0xc8, 0x70]);
    expect(bitstream.read(2)).toBe(1);
    expect(bitstream.peek(33)).toBe(0xeb7d7643);
    expect(bitstream.read(33)).toBe(0xeb7d7643);

    bitstream = makeBitstream([0xff, 0xff, 0xff, 0xff, 0xff]);
    expect(bitstream.peek(4)).toBe(0xf);
    expect(bitstream.peek(8)).toBe(0xff);
    expect(bitstream.peek(12)).toBe(0xfff);
    expect(bitstream.peek(16)).toBe(0xffff);
    expect(bitstream.peek(20)).toBe(0xfffff);
    expect(bitstream.peek(24)).toBe(0xffffff);
    expect(bitstream.peek(28)).toBe(0xfffffff);
    expect(bitstream.peek(32)).toBe(0xffffffff);
    expect(bitstream.peek(36)).toBe(0xfffffffff);
    expect(bitstream.peek(40)).toBe(0xffffffffff);
  });

  it("read/peek signed", () => {
    let bitstream = makeBitstream([0x5d, 0x6f, 0xae, 0xc8, 0x70, 0x9a, 0x25, 0xf3]);
    expect(bitstream.peek(4, true)).toBe(5);
    expect(bitstream.read(4, true)).toBe(5);

    expect(bitstream.peek(4, true)).toBe(-3);
    expect(bitstream.read(4, true)).toBe(-3);

    expect(bitstream.peek(4, true)).toBe(6);
    expect(bitstream.read(4, true)).toBe(6);

    expect(bitstream.peek(4, true)).toBe(-1);
    expect(bitstream.read(4, true)).toBe(-1);

    expect(bitstream.peek(8, true)).toBe(-82);
    expect(bitstream.read(8, true)).toBe(-82);

    expect(bitstream.peek(12, true)).toBe(-889);
    expect(bitstream.read(12, true)).toBe(-889);

    expect(bitstream.peek(8, true)).toBe(9);
    expect(bitstream.read(8, true)).toBe(9);

    expect(bitstream.peek(19, true)).toBe(-191751);
    expect(bitstream.read(19, true)).toBe(-191751);

    expect(bitstream.peek(1, true)).toBe(-1);
    expect(bitstream.read(1, true)).toBe(-1);

    bitstream = makeBitstream([0x5d, 0x6f, 0xae, 0xc8, 0x70, 0x9a, 0x25, 0xf3]);
    bitstream.advance(1);

    expect(bitstream.peek(35, true)).toBe(-9278133113);
    expect(bitstream.read(35, true)).toBe(-9278133113);

    bitstream = makeBitstream([0xff, 0xff, 0xff, 0xff, 0xff]);
    expect(bitstream.peek(4, true)).toBe(-1);
    expect(bitstream.peek(8, true)).toBe(-1);
    expect(bitstream.peek(12, true)).toBe(-1);
    expect(bitstream.peek(16, true)).toBe(-1);
    expect(bitstream.peek(20, true)).toBe(-1);
    expect(bitstream.peek(24, true)).toBe(-1);
    expect(bitstream.peek(28, true)).toBe(-1);
    expect(bitstream.peek(31, true)).toBe(-1);
    expect(bitstream.peek(32, true)).toBe(-1);
    expect(bitstream.peek(36, true)).toBe(-1);
    expect(bitstream.peek(40, true)).toBe(-1);
  });

  it("readLSB unsigned", () => {
    // { byte 1 } { byte 2 }
    // { 3   2      1 } { 3 }
    // { 1][111][1100] } { [0000 1000 } -> 0xfc08
    let bitstream = makeBitstream([0xfc, 0x08]);

    expect(bitstream.peekLSB(4)).toBe(12);
    expect(bitstream.readLSB(4)).toBe(12);

    expect(bitstream.peekLSB(3)).toBe(7);
    expect(bitstream.readLSB(3)).toBe(7);

    expect(bitstream.peekLSB(9)).toBe(0x11);
    expect(bitstream.readLSB(9)).toBe(0x11);

    //       4            3           2           1
    // [0111 0000][1001 1010][0010 0101] 1[111 0011]-> 0x709a25f3
    bitstream = makeBitstream([0x70, 0x9a, 0x25, 0xf3]);

    expect(bitstream.peekLSB(32)).toBe(0xf3259a70);
    expect(bitstream.peekLSB(31)).toBe(0x73259a70);
    expect(bitstream.readLSB(31)).toBe(0x73259a70);

    expect(bitstream.peekLSB(1)).toBe(1);
    expect(bitstream.readLSB(1)).toBe(1);

    bitstream = makeBitstream([0xc8, 0x70, 0x9a, 0x25, 0xf3]);
    expect(bitstream.peekLSB(40)).toBe(0xf3259a70c8);
    expect(bitstream.readLSB(40)).toBe(0xf3259a70c8);

    bitstream = makeBitstream([0x70, 0x9a, 0x25, 0xff, 0xf3]);
    expect(bitstream.peekLSB(40)).toBe(0xf3ff259a70);
    expect(bitstream.readLSB(40)).toBe(0xf3ff259a70);

    bitstream = makeBitstream([0xff, 0xff, 0xff, 0xff, 0xff]);
    expect(bitstream.peekLSB(4)).toBe(0xf);
    expect(bitstream.peekLSB(8)).toBe(0xff);
    expect(bitstream.peekLSB(12)).toBe(0xfff);
    expect(bitstream.peekLSB(16)).toBe(0xffff);
    expect(bitstream.peekLSB(20)).toBe(0xfffff);
    expect(bitstream.peekLSB(24)).toBe(0xffffff);
    expect(bitstream.peekLSB(28)).toBe(0xfffffff);
    expect(bitstream.peekLSB(32)).toBe(0xffffffff);
    expect(bitstream.peekLSB(36)).toBe(0xfffffffff);
    expect(bitstream.peekLSB(40)).toBe(0xffffffffff);
  });

  it("readLSB signed", () => {
    let bitstream = makeBitstream([0xfc, 0x08]);
    expect(bitstream.peekLSB(4, true)).toBe(-4);
    expect(bitstream.readLSB(4, true)).toBe(-4);

    expect(bitstream.peekLSB(3, true)).toBe(-1);
    expect(bitstream.readLSB(3, true)).toBe(-1);

    expect(bitstream.peekLSB(9, true)).toBe(0x11);
    expect(bitstream.readLSB(9, true)).toBe(0x11);

    bitstream = makeBitstream([0x70, 0x9a, 0x25, 0xf3]);
    expect(bitstream.peekLSB(32, true)).toBe(-215639440);
    expect(bitstream.peekLSB(31, true)).toBe(-215639440);
    expect(bitstream.readLSB(31, true)).toBe(-215639440);

    expect(bitstream.peekLSB(1, true)).toBe(-1);
    expect(bitstream.readLSB(1, true)).toBe(-1);

    bitstream = makeBitstream([0xc8, 0x70, 0x9a, 0x25, 0xf3]);
    expect(bitstream.peekLSB(40, true)).toBe(-55203696440);
    expect(bitstream.readLSB(40, true)).toBe(-55203696440);

    bitstream = makeBitstream([0x70, 0x9a, 0x25, 0xff, 0xf3]);
    expect(bitstream.peekLSB(40, true)).toBe(-51553920400);
    expect(bitstream.readLSB(40, true)).toBe(-51553920400);

    bitstream = makeBitstream([0xff, 0xff, 0xff, 0xff, 0xff]);
    expect(bitstream.peekLSB(4, true)).toBe(-1);
    expect(bitstream.peekLSB(8, true)).toBe(-1);
    expect(bitstream.peekLSB(12, true)).toBe(-1);
    expect(bitstream.peekLSB(16, true)).toBe(-1);
    expect(bitstream.peekLSB(20, true)).toBe(-1);
    expect(bitstream.peekLSB(24, true)).toBe(-1);
    expect(bitstream.peekLSB(28, true)).toBe(-1);
    expect(bitstream.peekLSB(31, true)).toBe(-1);
    expect(bitstream.peekLSB(32, true)).toBe(-1);
    expect(bitstream.peekLSB(36, true)).toBe(-1);
    expect(bitstream.peekLSB(40, true)).toBe(-1);
  });
});
