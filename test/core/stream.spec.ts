import * as AV from '../../src/core/';

describe('core/stream', () => {
	let makeStream = (...arrays: any[][]) => {
		let list = new AV.BufferList();
		arrays.forEach(element => {
			list.append(new AV.Buffer(new Uint8Array(element)));
		});
		return new AV.Stream(list);
	}

	it("copy", () => {
		let stream = makeStream([10, 160], [20, 29, 119]);
		let copy = stream.copy();

		expect(copy).toEqual(stream);
		expect(copy).not.toBe(stream);
	});

	it("advance", () => {
		let stream = makeStream([10, 160], [20, 29, 119]);
		expect(stream.offset).toBe(0);

		stream.advance(2);
		expect(stream.offset).toBe(2);

		expect(() => { stream.advance(10) }).toThrowError(AV.UnderflowError);
	});

	it("rewind", () => {
		let stream = makeStream([10, 160], [20, 29, 119]);

		stream.advance(4);
		expect(stream.offset).toBe(4);
		expect(stream.localOffset).toBe(2);

		stream.rewind(2);
		expect(stream.offset).toBe(2);
		expect(stream.localOffset).toBe(0);

		stream.rewind(1);
		expect(stream.offset).toBe(1);
		expect(stream.localOffset).toBe(1);

		stream.advance(3);
		expect(stream.offset).toBe(4);
		expect(stream.localOffset).toBe(2);

		stream.rewind(4);
		expect(stream.offset).toBe(0);
		expect(stream.localOffset).toBe(0);

		stream.advance(5);
		stream.rewind(4);
		expect(stream.offset).toBe(1);
		expect(stream.localOffset).toBe(1);

		expect(() => { stream.rewind(10) }).toThrowError(AV.UnderflowError);
	});

	it("seek", () => {
		let stream = makeStream([10, 160], [20, 29, 119]);

		stream.seek(3);
		expect(stream.offset).toBe(3);
		expect(stream.localOffset).toBe(1);

		stream.seek(1);
		expect(stream.offset).toBe(1);
		expect(stream.localOffset).toBe(1);

		expect(() => { stream.seek(100) }).toThrowError(AV.UnderflowError);
		expect(() => { stream.seek(-10) }).toThrowError(AV.UnderflowError);
	});

	it("remainingBytes", () => {
		let stream = makeStream([10, 160], [20, 29, 119]);

		expect(stream.remainingBytes()).toBe(5);

		stream.advance(2);
		expect(stream.remainingBytes()).toBe(3);
	});

	it("buffer", () => {
		let stream = makeStream([10, 160], [20, 29, 119]);

		expect(stream.peekBuffer(0, 4)).toEqual(new AV.Buffer(new Uint8Array([10, 160, 20, 29])));
		expect(stream.peekBuffer(1, 4)).toEqual(new AV.Buffer(new Uint8Array([160, 20, 29, 119])));
		expect(stream.readBuffer(4)).toEqual(new AV.Buffer(new Uint8Array([10, 160, 20, 29])));
	});

	it("single buffer", () => {
		let stream = makeStream([10, 160], [20, 29, 119]);

		expect(stream.peekSingleBuffer(0, 4)).toEqual(new AV.Buffer(new Uint8Array([10, 160])));
		expect(stream.readSingleBuffer(4)).toEqual(new AV.Buffer(new Uint8Array([10, 160])));
	});

	it("uint8", () => {
		let stream = makeStream([10, 160], [20, 29, 119]);
		let values = [10, 160, 20, 29, 119];

		for (let i = 0; i < values.length; i++) {
			expect(stream.peekUInt8(i)).toBe(values[i]);
		}

		expect(() => { stream.peekUInt8(10) }).toThrowError(AV.UnderflowError);

		for (let i = 0; i < values.length; i++) {
			expect(stream.readUInt8()).toBe(values[i]);
		}

		expect(() => { stream.readUInt8() }).toThrowError(AV.UnderflowError);

		stream = makeStream([255, 23]);
		expect(stream.readUInt8()).toBe(255);
	});

	it("int8", () => {
		let stream = makeStream([0x23, 0xff, 0x87], [0xab, 0x7c, 0xef]);
		let values = [0x23, -1, -121, -85, 124, -17];

		for (let i = 0; i < values.length; i++) {
			expect(stream.peekInt8(i)).toBe(values[i]);
		}

		for (let i = 0; i < values.length; i++) {
			expect(stream.readInt8()).toBe(values[i]);
		}
	});

	it('uint16', () => {
		let stream = makeStream([0, 0x23, 0x42], [0x3f]);
		let copy = stream.copy();

		let values = [0x23, 0x2342, 0x423f];
		for (let i = 0; i < values.length; i++) expect(stream.peekUInt16(i)).toBe(values[i]);

		values = [0x2300, 0x4223, 0x3f42];
		for (let i = 0; i < values.length; i++) expect(stream.peekUInt16(i, true)).toBe(values[i]);

		values = [0x23, 0x423f];
		for (let i = 0; i < values.length; i++) expect(stream.readUInt16()).toBe(values[i]);

		values = [0x2300, 0x3f42];
		for (let i = 0; i < values.length; i++) expect(copy.readUInt16(true)).toBe(values[i]);

		// check that it interprets as unsigned
		stream = makeStream([0xfe, 0xfe]);
		expect(stream.peekUInt16(0)).toBe(0xfefe);
		expect(stream.peekUInt16(0, true)).toBe(0xfefe);
	});

	it('int16', () => {
		let stream = makeStream([0x16, 0x79, 0xff], [0x80]);
		let copy = stream.copy();

		// peeking big endian
		let values = [0x1679, -128];
		for (let i = 0; i < values.length; i++) expect(stream.peekInt16(i * 2)).toBe(values[i]);

		// peeking little endian
		values = [0x7916, -32513];
		for (let i = 0; i < values.length; i++) expect(stream.peekInt16(i * 2, true)).toBe(values[i]);

		// reading big endian
		values = [0x1679, -128];
		for (let i = 0; i < values.length; i++) expect(stream.readInt16()).toBe(values[i]);

		// reading little endian
		values = [0x7916, -32513]
		for (let i = 0; i < values.length; i++) expect(copy.readInt16(true)).toBe(values[i]);
	});

	it('uint24', () => {
		let stream = makeStream([0x23, 0x16], [0x56, 0x11, 0x78, 0xaf]);
		let copy = stream.copy();

		// peeking big endian
		let values = [0x231656, 0x165611, 0x561178, 0x1178af];
		for (let i = 0; i < values.length; i++) expect(stream.peekUInt24(i)).toBe(values[i]);

		// peeking little endian
		values = [0x561623, 0x115616, 0x781156, 0xaf7811];
		for (let i = 0; i < values.length; i++) expect(stream.peekUInt24(i, true)).toBe(values[i]);

		// reading big endian
		values = [0x231656, 0x1178af];
		for (let i = 0; i < values.length; i++) expect(stream.readUInt24()).toBe(values[i]);

		// reading little endian
		values = [0x561623, 0xaf7811]
		for (let i = 0; i < values.length; i++) expect(copy.readUInt24(true)).toBe(values[i]);
	});

	it('int24', () => {
		let stream = makeStream([0x23, 0x16, 0x56], [0xff, 0x10, 0xfa]);
		let copy = stream.copy();

		// peeking big endian
		let values = [0x231656, 0x1656ff, 0x56ff10, -61190];
		for (let i = 0; i < values.length; i++) expect(stream.peekInt24(i)).toBe(values[i]);

		// peeking little endian
		values = [0x561623, -43498, 0x10ff56, -388865];
		for (let i = 0; i < values.length; i++) expect(stream.peekInt24(i, true)).toBe(values[i]);

		// reading big endian
		values = [0x231656, -61190];
		for (let i = 0; i < values.length; i++) expect(stream.readInt24()).toBe(values[i]);

		// reading little endian
		values = [0x561623, -388865]
		for (let i = 0; i < values.length; i++) expect(copy.readInt24(true)).toBe(values[i]);
	});

	it('uint32', () => {
		let stream = makeStream([0x32, 0x65, 0x42], [0x56, 0x23], [0xff, 0x45, 0x11]);
		let copy = stream.copy();

		// peeking big endian
		let values = [0x32654256, 0x65425623, 0x425623ff, 0x5623ff45, 0x23ff4511];
		for (let i = 0; i < values.length; i++) expect(stream.peekUInt32(i)).toBe(values[i]);

		// peeking little endian
		values = [0x56426532, 0x23564265, 0xff235642, 0x45ff2356, 0x1145ff23];
		for (let i = 0; i < values.length; i++) expect(stream.peekUInt32(i, true)).toBe(values[i]);

		// reading big endian
		values = [0x32654256, 0x23ff4511];
		for (let i = 0; i < values.length; i++) expect(stream.readUInt32()).toBe(values[i]);

		// reading little endian
		values = [0x56426532, 0x1145ff23]
		for (let i = 0; i < values.length; i++) expect(copy.readUInt32(true)).toBe(values[i]);
	});

	it('uint32', () => {
		let stream = makeStream([0x43, 0x53], [0x16, 0x79, 0xff, 0xfe], [0xef, 0xfa]);
		let copy = stream.copy();

		let stream2 = makeStream([0x42, 0xc3, 0x95], [0xa9, 0x36, 0x17]);
		let copy2 = stream2.copy();

		// peeking big endian
		let values = [0x43531679, -69638];
		for (let i = 0; i < values.length; i++) expect(stream.peekInt32(i * 4)).toBe(values[i]);

		values = [0x42c395a9, -1013601994, -1784072681];
		for (let i = 0; i < values.length; i++) expect(stream2.peekInt32(i)).toBe(values[i]);

		// peeking little endian
		values = [0x79165343, -84934913];
		for (let i = 0; i < values.length; i++) expect(stream.peekInt32(i * 4, true)).toBe(values[i]);

		values = [-1449802942, 917083587, 389458325];
		for (let i = 0; i < values.length; i++) expect(stream2.peekInt32(i, true)).toBe(values[i]);

		values = [0x43531679, -69638];
		for (let i = 0; i < values.length; i++) expect(stream.readInt32()).toBe(values[i]);

		values = [0x79165343, -84934913];
		for (let i = 0; i < values.length; i++) expect(copy.readInt32(true)).toBe(values[i]);

		stream = makeStream([0xff, 0xff, 0xff, 0xff])
		expect(stream.peekInt32()).toBe(-1);
		expect(stream.peekInt32(0, true)).toBe(-1);
	});

	it('float32', () => {
		let stream = makeStream([0, 0, 0x80], [0x3f, 0, 0, 0, 0xc0], [0xab, 0xaa],
			[0xaa, 0x3e, 0, 0, 0, 0], [0, 0, 0], [0x80, 0, 0, 0x80], [0x7f, 0, 0, 0x80, 0xff]);
		let copy = stream.copy();

		let valuesBE = [4.600602988224807e-41, 2.6904930515036488e-43, -1.2126478207002966e-12, 0, 1.793662034335766e-43, 4.609571298396486e-41, 4.627507918739843e-41];
		let valuesLE = [1, -2, 0.3333333432674408, 0, 0, Infinity, -Infinity];

		// peeking big endian
		for (let i = 0; i < valuesBE.length; i++) expect(stream.peekFloat32(i * 4)).toBeCloseTo(valuesBE[i], 4);

		// peeking little endian
		for (let i = 0; i < valuesLE.length; i++) expect(stream.peekFloat32(i * 4, true)).toBeCloseTo(valuesLE[i], 4);

		// reading big endian
		for (let i = 0; i < valuesBE.length; i++) expect(stream.readFloat32()).toBeCloseTo(valuesBE[i], 4);

		// reading little endian
		for (let i = 0; i < valuesLE.length; i++) expect(copy.readFloat32(true)).toBeCloseTo(valuesLE[i], 4);

		// special cases
		let stream2 = makeStream([0xff, 0xff, 0x7f, 0x7f]);

		expect(stream2.peekFloat32(0)).toBeNaN();
		expect(stream2.peekFloat32(0, true)).toBeCloseTo(3.4028234663852886e+38, 4);
	});

	it('float64', () => {
		let stream = makeStream([0x55, 0x55, 0x55, 0x55, 0x55, 0x55], [0xd5, 0x3f]);
		let copy = stream.copy();
		expect(stream.peekFloat64(0)).toBeCloseTo(1.1945305291680097e+103, 4);
		expect(stream.peekFloat64(0, true)).toBeCloseTo(0.3333333333333333, 4);
		expect(stream.readFloat64()).toBeCloseTo(1.1945305291680097e+103, 4);
		expect(copy.readFloat64(true)).toBeCloseTo(0.3333333333333333, 4);

		stream = makeStream([1, 0, 0, 0, 0, 0], [0xf0, 0x3f]);
		copy = stream.copy();
		expect(stream.peekFloat64(0)).toBeCloseTo(7.291122019655968e-304, 4);
		expect(stream.peekFloat64(0, true)).toBeCloseTo(1.0000000000000002, 4);
		expect(stream.readFloat64()).toBeCloseTo(7.291122019655968e-304, 4);
		expect(copy.readFloat64(true)).toBeCloseTo(1.0000000000000002, 4);

		stream = makeStream([2, 0, 0, 0, 0, 0], [0xf0, 0x3f]);
		copy = stream.copy();
		expect(stream.peekFloat64(0)).toBeCloseTo(4.778309726801735e-299, 4);
		expect(stream.peekFloat64(0, true)).toBeCloseTo(1.0000000000000004, 4);
		expect(stream.readFloat64()).toBeCloseTo(4.778309726801735e-299, 4);
		expect(copy.readFloat64(true)).toBeCloseTo(1.0000000000000004, 4);

		stream = makeStream([0xff, 0xff, 0xff, 0xff, 0xff, 0xff], [0x0f, 0x00]);
		copy = stream.copy();
		expect(stream.peekFloat64(0)).toBeNaN();
		expect(stream.peekFloat64(0, true)).toBeCloseTo(2.225073858507201e-308, 4);
		expect(stream.readFloat64()).toBeNaN();
		expect(copy.readFloat64(true)).toBeCloseTo(2.225073858507201e-308, 4);

		stream = makeStream([0xff, 0xff, 0xff, 0xff, 0xff, 0xff], [0xef, 0x7f]);
		copy = stream.copy();
		expect(stream.peekFloat64(0)).toBeNaN();
		expect(stream.peekFloat64(0, true)).toBeCloseTo(1.7976931348623157e+308, 4);
		expect(stream.readFloat64()).toBeNaN();
		expect(copy.readFloat64(true)).toBeCloseTo(1.7976931348623157e+308, 4);

		stream = makeStream([0, 0, 0, 0, 0, 0], [0xf0, 0x3f]);
		copy = stream.copy();
		expect(stream.peekFloat64(0)).toBeCloseTo(3.03865e-319, 4);
		expect(stream.peekFloat64(0, true)).toBeCloseTo(1, 4);
		expect(stream.readFloat64()).toBeCloseTo(3.03865e-319, 4);
		expect(copy.readFloat64(true)).toBeCloseTo(1, 4);

		stream = makeStream([0, 0, 0, 0, 0, 0], [0x10, 0]);
		copy = stream.copy();
		expect(stream.peekFloat64(0)).toBeCloseTo(2.0237e-320, 4);
		expect(stream.peekFloat64(0, true)).toBeCloseTo(2.2250738585072014e-308, 4);
		expect(stream.readFloat64()).toBeCloseTo(2.0237e-320, 4);
		expect(copy.readFloat64(true)).toBeCloseTo(2.2250738585072014e-308, 4);

		stream = makeStream([0, 0, 0, 0, 0, 0], [0, 0]);
		copy = stream.copy();
		expect(stream.peekFloat64(0)).toBeCloseTo(0, 4);
		expect(stream.peekFloat64(0, true)).toBeCloseTo(0, 4);
		expect(1 / stream.peekFloat64(0, true) < 0).toBeFalsy();
		expect(stream.readFloat64()).toBeCloseTo(0, 4);
		expect(copy.readFloat64(true)).toBeCloseTo(0, 4);

		stream = makeStream([0, 0, 0, 0, 0, 0], [0, 0x80]);
		copy = stream.copy();
		expect(stream.peekFloat64(0)).toBeCloseTo(6.3e-322, 4);
		expect(stream.peekFloat64(0, true)).toBeCloseTo(0, 4);
		expect(1 / stream.peekFloat64(0, true) < 0).toBeTruthy();
		expect(stream.readFloat64()).toBeCloseTo(6.3e-322, 4);
		expect(copy.readFloat64(true)).toBeCloseTo(0, 4);

		stream = makeStream([0, 0, 0, 0, 0, 0], [0xf0, 0x7f]);
		copy = stream.copy();
		expect(stream.peekFloat64(0)).toBeCloseTo(3.0418e-319, 4);
		expect(stream.peekFloat64(0, true)).toBeCloseTo(Infinity);
		expect(stream.readFloat64()).toBeCloseTo(3.0418e-319, 4);
		expect(copy.readFloat64(true)).toBeCloseTo(Infinity);

		stream = makeStream([0, 0, 0, 0, 0, 0], [0xf0, 0xff]);
		copy = stream.copy();
		expect(stream.peekFloat64(0)).toBe(3.04814e-319);
		expect(stream.peekFloat64(0, true)).toBe(-Infinity);
		expect(stream.readFloat64()).toBe(3.04814e-319);
		expect(copy.readFloat64(true)).toBe(-Infinity);
	});

	it('float80', () => {
		let stream = makeStream([0x3f, 0xff, 0x80, 0x00, 0x00, 0x00], [0x00, 0x00, 0x00, 0x00]);
		let copy = stream.copy();
		expect(stream.peekFloat80()).toBe(1);
		expect(stream.peekFloat80(0, true)).toBe(0);
		expect(stream.readFloat80()).toBe(1);
		expect(copy.readFloat80(true)).toBe(0);

		stream = makeStream([0x00, 0x00, 0x00], [0x00, 0x00, 0x00, 0x00, 0x80, 0xff, 0x3f]);
		expect(stream.peekFloat80(0, true)).toBe(1);
		expect(stream.readFloat80(true)).toBe(1);

		stream = makeStream([0xbf, 0xff, 0x80, 0x00, 0x00, 0x00], [0x00, 0x00, 0x00, 0x00]);
		copy = stream.copy();
		expect(stream.peekFloat80()).toBe(-1);
		expect(stream.peekFloat80(0, true)).toBe(0);
		expect(stream.readFloat80()).toBe(-1);
		expect(copy.readFloat80(true)).toBe(0);

		stream = makeStream([0x00, 0x00, 0x00], [0x00, 0x00, 0x00, 0x00, 0x80, 0xff, 0xbf]);
		expect(stream.peekFloat80(0, true)).toBe(-1);
		expect(stream.readFloat80(true)).toBe(-1);

		stream = makeStream([0x40, 0x0e, 0xac, 0x44, 0, 0, 0, 0, 0, 0]);
		copy = stream.copy();
		expect(stream.peekFloat80()).toBe(44100);
		expect(stream.peekFloat80(0, true)).toBe(0);
		expect(stream.readFloat80()).toBe(44100);
		expect(copy.readFloat80(true)).toBe(0);

		stream = makeStream([0, 0, 0, 0, 0, 0, 0x44, 0xac, 0x0e, 0x40]);
		expect(stream.peekFloat80(0, true)).toBe(44100);
		expect(stream.readFloat80(true)).toBe(44100);

		stream = makeStream([0x7f, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
		copy = stream.copy();
		expect(stream.peekFloat80()).toBe(Infinity);
		expect(stream.peekFloat80(0, true)).toBe(0);
		expect(stream.readFloat80()).toBe(Infinity);
		expect(copy.readFloat80(true)).toBe(0);

		stream = makeStream([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0x7f]);
		expect(stream.peekFloat80(0, true)).toBe(Infinity);
		expect(stream.readFloat80(true)).toBe(Infinity);

		stream = makeStream([0xff, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
		expect(stream.peekFloat80(0)).toBe(-Infinity);
		expect(stream.readFloat80()).toBe(-Infinity);

		stream = makeStream([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff]);
		expect(stream.peekFloat80(0, true)).toBe(-Infinity);
		expect(stream.readFloat80(true)).toBe(-Infinity);

		stream = makeStream([0x7f, 0xff, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
		expect(stream.peekFloat80()).toBeNaN();
		expect(stream.readFloat80()).toBeNaN();

		stream = makeStream([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0x7f]);
		expect(stream.peekFloat80(0, true)).toBeNaN();
		expect(stream.readFloat80(true)).toBeNaN();

		stream = makeStream([0x40, 0x00, 0xc9, 0x0f, 0xda, 0x9e, 0x46, 0xa7, 0x88, 0x00]);
		expect(stream.peekFloat80()).toBe(3.14159265);
		expect(stream.readFloat80()).toBe(3.14159265);

		stream = makeStream([0x00, 0x88, 0xa7, 0x46, 0x9e, 0xda, 0x0f, 0xc9, 0x00, 0x40]);
		expect(stream.peekFloat80(0, true)).toBe(3.14159265);
		expect(stream.readFloat80(true)).toBe(3.14159265);

		stream = makeStream([0x3f, 0xfd, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xa8, 0xff]);
		copy = stream.copy();
		expect(stream.peekFloat80()).toBe(0.3333333333333333);
		expect(stream.peekFloat80(0, true)).toBe(-Infinity);
		expect(stream.readFloat80()).toBe(0.3333333333333333);
		expect(copy.readFloat80(true)).toBe(-Infinity);

		stream = makeStream([0x41, 0x55, 0xaa, 0xaa, 0xaa, 0xaa, 0xae, 0xa9, 0xf8, 0x00]);
		expect(stream.peekFloat80()).toBe(1.1945305291680097e+103);
		expect(stream.readFloat80()).toBe(1.1945305291680097e+103);
	});

	it('ascii/latin1', () => {
		let stream = makeStream([0x68, 0x65, 0x6c, 0x6c, 0x6f]);
		expect(stream.peekString(0, 5)).toBe("hello");
		expect(stream.peekString(0, 5, "ascii")).toBe("hello");
		expect(stream.peekString(0, 5, "latin1")).toBe("hello");
		expect(stream.readString(5, "ascii")).toBe("hello");
		expect(stream.offset).toBe(5);
	});

	it('ascii/latin1 null terminated', () => {
		let stream = makeStream([0x68, 0x65, 0x6c, 0x6c, 0x6f, 0]);
		expect(stream.peekString(0, 6)).toBe("hello\0");
		expect(stream.peekString(0, null)).toBe("hello");
		expect(stream.readString(null)).toBe("hello");
		expect(stream.offset).toBe(6);
	});

	it('utf8', () => {
		let stream = makeStream([195, 188, 98, 101, 114]);
		expect(stream.peekString(0, 5, "utf8")).toBe("über");
		expect(stream.readString(5, "utf8")).toBe("über");
		expect(stream.offset).toBe(5);

		stream = makeStream([0xc3, 0xb6, 0xe6, 0x97, 0xa5, 0xe6, 0x9c, 0xac, 0xe8, 0xaa, 0x9e]);
		expect(stream.peekString(0, 11, "utf8")).toBe("ö日本語");
		expect(stream.readString(11, "utf8")).toBe("ö日本語");
		expect(stream.offset).toBe(11);

		stream = makeStream([0xf0, 0x9f, 0x91, 0x8d]);
		expect(stream.peekString(0, 4, "utf8")).toBe("👍");
		expect(stream.readString(4, "utf8")).toBe("👍");
		expect(stream.offset).toBe(4);

		stream = makeStream([0xe2, 0x82, 0xac]);
		expect(stream.peekString(0, 3, "utf8")).toBe("€");
		expect(stream.readString(3, "utf8")).toBe("€");
		expect(stream.offset).toBe(3);
	});

	it('utf8 null terminated', () => {
		let stream = makeStream([195, 188, 98, 101, 114, 0]);
		expect(stream.peekString(0, null, "utf8")).toBe("über");
		expect(stream.readString(null, "utf8")).toBe("über");
		expect(stream.offset).toBe(6);

		stream = makeStream([0xc3, 0xb6, 0xe6, 0x97, 0xa5, 0xe6, 0x9c, 0xac, 0xe8, 0xaa, 0x9e, 0]);
		expect(stream.peekString(0, null, "utf8")).toBe("ö日本語");
		expect(stream.readString(null, "utf8")).toBe("ö日本語");
		expect(stream.offset).toBe(12);

		stream = makeStream([0xf0, 0x9f, 0x91, 0x8d, 0]);
		expect(stream.peekString(0, null, "utf8")).toBe("👍");
		expect(stream.readString(null, "utf8")).toBe("👍");
		expect(stream.offset).toBe(5);

		stream = makeStream([0xe2, 0x82, 0xac, 0]);
		expect(stream.peekString(0, null, "utf8")).toBe("€");
		expect(stream.readString(null, "utf8")).toBe("€");
		expect(stream.offset).toBe(4);
	});

	it('utf16be', () => {
		let stream = makeStream([0, 252, 0, 98, 0, 101, 0, 114]);
		expect(stream.peekString(0, 8, "utf16be")).toBe("über");
		expect(stream.readString(8, "utf16be")).toBe("über");
		expect(stream.offset).toBe(8);

		stream = makeStream([4, 63, 4, 64, 4, 56, 4, 50, 4, 53, 4, 66]);
		expect(stream.peekString(0, 12, "utf16be")).toBe("привет");
		expect(stream.readString(12, "utf16be")).toBe("привет");
		expect(stream.offset).toBe(12);

		stream = makeStream([0, 0xf6, 0x65, 0xe5, 0x67, 0x2c, 0x8a, 0x9e]);
		expect(stream.peekString(0, 8, "utf16be")).toBe("ö日本語");
		expect(stream.readString(8, "utf16be")).toBe("ö日本語");
		expect(stream.offset).toBe(8);

		stream = makeStream([0xd8, 0x3d, 0xdc, 0x4d]);
		expect(stream.peekString(0, 4, "utf16be")).toBe("👍");
		expect(stream.readString(4, "utf16be")).toBe("👍");
		expect(stream.offset).toBe(4);
	});

	it('utf16-be null terminated', () => {
		let stream = makeStream([0, 252, 0, 98, 0, 101, 0, 114, 0, 0]);
		expect(stream.peekString(0, null, "utf16-be")).toBe("über");
		expect(stream.readString(null, "utf16-be")).toBe("über");
		expect(stream.offset).toBe(10);

		stream = makeStream([4, 63, 4, 64, 4, 56, 4, 50, 4, 53, 4, 66, 0, 0]);
		expect(stream.peekString(0, null, "utf16-be")).toBe("привет");
		expect(stream.readString(null, "utf16-be")).toBe("привет");
		expect(stream.offset).toBe(14);

		stream = makeStream([0, 0xf6, 0x65, 0xe5, 0x67, 0x2c, 0x8a, 0x9e, 0, 0]);
		expect(stream.peekString(0, null, "utf16-be")).toBe("ö日本語");
		expect(stream.readString(null, "utf16-be")).toBe("ö日本語");
		expect(stream.offset).toBe(10);

		stream = makeStream([0xd8, 0x3d, 0xdc, 0x4d, 0, 0]);
		expect(stream.peekString(0, null, "utf16-be")).toBe("👍");
		expect(stream.readString(null, "utf16-be")).toBe("👍");
		expect(stream.offset).toBe(6);
	});

	it('utf16le', () => {
		let stream = makeStream([252, 0, 98, 0, 101, 0, 114, 0]);
		expect(stream.peekString(0, 8, "utf16le")).toBe("über");
		expect(stream.readString(8, "utf16le")).toBe("über");
		expect(stream.offset).toBe(8);

		stream = makeStream([63, 4, 64, 4, 56, 4, 50, 4, 53, 4, 66, 4]);
		expect(stream.peekString(0, 12, "utf16le")).toBe("привет");
		expect(stream.readString(12, "utf16le")).toBe("привет");
		expect(stream.offset).toBe(12);

		stream = makeStream([0xf6, 0, 0xe5, 0x65, 0x2c, 0x67, 0x9e, 0x8a]);
		expect(stream.peekString(0, 8, "utf16le")).toBe("ö日本語");
		expect(stream.readString(8, "utf16le")).toBe("ö日本語");
		expect(stream.offset).toBe(8);

		stream = makeStream([0x42, 0x30, 0x44, 0x30, 0x46, 0x30, 0x48, 0x30, 0x4a, 0x30]);
		expect(stream.peekString(0, 10, "utf16le")).toBe("あいうえお");
		expect(stream.readString(10, "utf16le")).toBe("あいうえお");
		expect(stream.offset).toBe(10);

		stream = makeStream([0x3d, 0xd8, 0x4d, 0xdc]);
		expect(stream.peekString(0, 4, "utf16le")).toBe("👍");
		expect(stream.readString(4, "utf16le")).toBe("👍");
		expect(stream.offset).toBe(4);
	});

	it('utf16-le null terminated', () => {
		let stream = makeStream([252, 0, 98, 0, 101, 0, 114, 0, 0, 0]);
		expect(stream.peekString(0, null, "utf16le")).toBe("über");
		expect(stream.readString(null, "utf16le")).toBe("über");
		expect(stream.offset).toBe(10);

		stream = makeStream([63, 4, 64, 4, 56, 4, 50, 4, 53, 4, 66, 4, 0, 0]);
		expect(stream.peekString(0, null, "utf16le")).toBe("привет");
		expect(stream.readString(null, "utf16le")).toBe("привет");
		expect(stream.offset).toBe(14);

		stream = makeStream([0xf6, 0, 0xe5, 0x65, 0x2c, 0x67, 0x9e, 0x8a, 0, 0]);
		expect(stream.peekString(0, null, "utf16le")).toBe("ö日本語");
		expect(stream.readString(null, "utf16le")).toBe("ö日本語");
		expect(stream.offset).toBe(10);

		stream = makeStream([0x42, 0x30, 0x44, 0x30, 0x46, 0x30, 0x48, 0x30, 0x4a, 0x30, 0, 0]);
		expect(stream.peekString(0, null, "utf16le")).toBe("あいうえお");
		expect(stream.readString(null, "utf16le")).toBe("あいうえお");
		expect(stream.offset).toBe(12);

		stream = makeStream([0x3d, 0xd8, 0x4d, 0xdc, 0, 0]);
		expect(stream.peekString(0, null, "utf16le")).toBe("👍");
		expect(stream.readString(null, "utf16le")).toBe("👍");
		expect(stream.offset).toBe(6);
	});

	it('utf16bom big endian', () => {
		let stream = makeStream([0xfe, 0xff, 0, 252, 0, 98, 0, 101, 0, 114]);
		expect(stream.peekString(0, 10, "utf16bom")).toBe("über");
		expect(stream.readString(10, "utf16bom")).toBe("über");
		expect(stream.offset).toBe(10);

		stream = makeStream([0xfe, 0xff, 4, 63, 4, 64, 4, 56, 4, 50, 4, 53, 4, 66]);
		expect(stream.peekString(0, 14, "utf16bom")).toBe("привет");
		expect(stream.readString(14, "utf16bom")).toBe("привет");
		expect(stream.offset).toBe(14);

		stream = makeStream([0xfe, 0xff, 0, 0xf6, 0x65, 0xe5, 0x67, 0x2c, 0x8a, 0x9e]);
		expect(stream.peekString(0, 10, "utf16bom")).toBe("ö日本語");
		expect(stream.readString(10, "utf16bom")).toBe("ö日本語");
		expect(stream.offset).toBe(10);

		stream = makeStream([0xfe, 0xff, 0xd8, 0x3d, 0xdc, 0x4d]);
		expect(stream.peekString(0, 6, "utf16bom")).toBe("👍");
		expect(stream.readString(6, "utf16bom")).toBe("👍");
		expect(stream.offset).toBe(6);
	});

	it('utf16-bom big endian, null terminated', () => {
		let stream = makeStream([0xfe, 0xff, 0, 252, 0, 98, 0, 101, 0, 114, 0, 0]);
		expect(stream.peekString(0, null, "utf16bom")).toBe("über");
		expect(stream.readString(null, "utf16bom")).toBe("über");
		expect(stream.offset).toBe(12);

		stream = makeStream([0xfe, 0xff, 4, 63, 4, 64, 4, 56, 4, 50, 4, 53, 4, 66, 0, 0]);
		expect(stream.peekString(0, null, "utf16bom")).toBe("привет");
		expect(stream.readString(null, "utf16bom")).toBe("привет");
		expect(stream.offset).toBe(16);

		stream = makeStream([0xfe, 0xff, 0, 0xf6, 0x65, 0xe5, 0x67, 0x2c, 0x8a, 0x9e, 0, 0]);
		expect(stream.peekString(0, null, "utf16bom")).toBe("ö日本語");
		expect(stream.readString(null, "utf16bom")).toBe("ö日本語");
		expect(stream.offset).toBe(12);

		stream = makeStream([0xfe, 0xff, 0xd8, 0x3d, 0xdc, 0x4d, 0, 0]);
		expect(stream.peekString(0, null, "utf16bom")).toBe("👍");
		expect(stream.readString(null, "utf16bom")).toBe("👍");
		expect(stream.offset).toBe(8);
	});

	it('utf16bom little endian', () => {
		let stream = makeStream([0xff, 0xfe, 252, 0, 98, 0, 101, 0, 114, 0]);
		expect(stream.peekString(0, 10, "utf16bom")).toBe("über");
		expect(stream.readString(10, "utf16bom")).toBe("über");
		expect(stream.offset).toBe(10);

		stream = makeStream([0xff, 0xfe, 63, 4, 64, 4, 56, 4, 50, 4, 53, 4, 66, 4]);
		expect(stream.peekString(0, 14, "utf16bom")).toBe("привет");
		expect(stream.readString(14, "utf16bom")).toBe("привет");
		expect(stream.offset).toBe(14);

		stream = makeStream([0xff, 0xfe, 0xf6, 0, 0xe5, 0x65, 0x2c, 0x67, 0x9e, 0x8a]);
		expect(stream.peekString(0, 10, "utf16bom")).toBe("ö日本語");
		expect(stream.readString(10, "utf16bom")).toBe("ö日本語");
		expect(stream.offset).toBe(10);

		stream = makeStream([0xff, 0xfe, 0x3d, 0xd8, 0x4d, 0xdc]);
		expect(stream.peekString(0, 6, "utf16bom")).toBe("👍");
		expect(stream.readString(6, "utf16bom")).toBe("👍");
		expect(stream.offset).toBe(6);
	});

	it('utf16-bom little endian, null terminated', () => {
		let stream = makeStream([0xff, 0xfe, 252, 0, 98, 0, 101, 0, 114, 0, 0, 0]);
		expect(stream.peekString(0, null, "utf16bom")).toBe("über");
		expect(stream.readString(null, "utf16bom")).toBe("über");
		expect(stream.offset).toBe(12);

		stream = makeStream([0xff, 0xfe, 63, 4, 64, 4, 56, 4, 50, 4, 53, 4, 66, 4, 0, 0]);
		expect(stream.peekString(0, null, "utf16bom")).toBe("привет");
		expect(stream.readString(null, "utf16bom")).toBe("привет");
		expect(stream.offset).toBe(16);

		stream = makeStream([0xff, 0xfe, 0xf6, 0, 0xe5, 0x65, 0x2c, 0x67, 0x9e, 0x8a, 0, 0]);
		expect(stream.peekString(0, null, "utf16bom")).toBe("ö日本語");
		expect(stream.readString(null, "utf16bom")).toBe("ö日本語");
		expect(stream.offset).toBe(12);

		stream = makeStream([0xff, 0xfe, 0x3d, 0xd8, 0x4d, 0xdc, 0, 0]);
		expect(stream.peekString(0, null, "utf16bom")).toBe("👍");
		expect(stream.readString(null, "utf16bom")).toBe("👍");
		expect(stream.offset).toBe(8);
	});
});
