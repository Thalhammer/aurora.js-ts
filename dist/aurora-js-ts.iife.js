var AV = (function (exports, fs, http) {
    'use strict';

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n["default"] = e;
        return Object.freeze(n);
    }

    var fs__namespace = /*#__PURE__*/_interopNamespace(fs);
    var http__namespace = /*#__PURE__*/_interopNamespace(http);

    /**
     * Base class used for all classes
     *
     * @export
     * @class Base
     */
    var Base = /** @class */ (function () {
        function Base() {
        }
        return Base;
    }());

    var Buffer = /** @class */ (function () {
        function Buffer(input) {
            if (input instanceof Uint8Array || input.constructor.name === 'Uint8Array') {
                this.data = input;
            }
            else if (input instanceof ArrayBuffer || Array.isArray(input) || input.constructor.name === 'ArrayBuffer'
                || (typeof global !== 'undefined' && global.Buffer && global.Buffer.isBuffer(input))) {
                this.data = new Uint8Array(input);
            }
            else if (typeof input === 'number') { // This is split from above to make typescript happy
                this.data = new Uint8Array(input);
            }
            else if (input.buffer && (input.buffer instanceof ArrayBuffer || input.buffer.constructor.name === 'ArrayBuffer')) {
                this.data = new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
            }
            else if (input instanceof Buffer || input.constructor.name === 'Buffer') {
                this.data = input.data;
            }
            else {
                throw new Error('Constructing buffer with unknown type.');
            }
            this.next = null;
            this.prev = null;
        }
        Object.defineProperty(Buffer.prototype, "length", {
            get: function () {
                return this.data.length;
            },
            enumerable: false,
            configurable: true
        });
        Buffer.allocate = function (size) {
            return new Buffer(size);
        };
        Buffer.makeBlob = function (data, type) {
            if (!type) {
                type = 'application/octet-stream';
            }
            if (Blob) {
                return new Blob([data], { type: type });
            }
            if (BlobBuilder) {
                var b = new BlobBuilder();
                b.append(data);
                return b.getBlob(type);
            }
            return null;
        };
        Buffer.makeBlobURL = function (data, type) {
            if (!URL) {
                return null;
            }
            return URL.createObjectURL(this.makeBlob(data, type));
        };
        Buffer.revokeBlobURL = function (url) {
            if (!URL) {
                return;
            }
            URL.revokeObjectURL(url);
        };
        Buffer.prototype.toBlob = function () {
            return Buffer.makeBlob(this.data.buffer);
        };
        Buffer.prototype.toBlobURL = function () {
            return Buffer.makeBlobURL(this.data.buffer);
        };
        Buffer.prototype.copy = function () {
            return new Buffer(new Uint8Array(this.data));
        };
        Buffer.prototype.slice = function (position, length) {
            if (!length) {
                length = this.length;
            }
            if (position === 0 && length >= this.length) {
                return new Buffer(this.data);
            }
            else {
                return new Buffer(this.data.subarray(position, position + length));
            }
        };
        return Buffer;
    }());

    var BufferList = /** @class */ (function () {
        function BufferList() {
            this.first = null;
            this.last = null;
            this.numBuffers = 0;
            this.availableBytes = 0;
            this.availableBuffers = 0;
        }
        BufferList.prototype.copy = function () {
            var result = new BufferList();
            result.first = this.first;
            result.last = this.last;
            result.numBuffers = this.numBuffers;
            result.availableBytes = this.availableBytes;
            result.availableBuffers = this.availableBuffers;
            return result;
        };
        BufferList.prototype.append = function (buffer) {
            buffer.prev = this.last;
            if (this.last) {
                this.last.next = buffer;
            }
            this.last = buffer;
            if (!this.first) {
                this.first = buffer;
            }
            this.availableBytes += buffer.length;
            this.availableBuffers++;
            this.numBuffers++;
        };
        BufferList.prototype.advance = function () {
            if (this.first) {
                this.availableBytes -= this.first.length;
                this.availableBuffers--;
                this.first = this.first.next;
                return !(!this.first);
            }
            return false;
        };
        BufferList.prototype.rewind = function () {
            if (this.first && !this.first.prev) {
                return false;
            }
            this.first = this.first ? this.first.prev : this.last;
            if (this.first) {
                this.availableBuffers++;
                this.availableBytes += this.first.length;
            }
            return !(!this.first);
        };
        BufferList.prototype.reset = function () {
            while (this.rewind()) {
            }
        };
        return BufferList;
    }());

    var __extends$j = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var UnderflowError = /** @class */ (function (_super) {
        __extends$j(UnderflowError, _super);
        function UnderflowError(m) {
            var _this = _super.call(this, m || 'UnderflowError') || this;
            Object.setPrototypeOf(_this, UnderflowError.prototype);
            _this.name = 'UnderflowError';
            return _this;
        }
        return UnderflowError;
    }(Error));

    var __extends$i = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var EventHost = /** @class */ (function (_super) {
        __extends$i(EventHost, _super);
        function EventHost() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        EventHost.prototype.on = function (event, fn) {
            if (!this.events) {
                this.events = {};
            }
            if (!this.events[event]) {
                this.events[event] = [];
            }
            this.events[event].push(fn);
        };
        EventHost.prototype.off = function (event, fn) {
            if (!this.events) {
                return;
            }
            if (!this.events[event]) {
                return;
            }
            if (!fn) {
                if (!event) {
                    this.events = {};
                }
                else {
                    this.events[event] = [];
                }
                return;
            }
            var idx = this.events[event].indexOf(fn);
            if (idx >= 0) {
                this.events[event].splice(idx, 1);
            }
        };
        EventHost.prototype.once = function (event, fn) {
            var _this = this;
            var cb = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                _this.off(event, cb);
                fn.apply(_this, args);
            };
            this.on(event, cb);
        };
        EventHost.prototype.emit = function (event) {
            var _this = this;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            // console.log(this.constructor.name, event, args);
            if (!this.events || !this.events[event]) {
                return;
            }
            this.events[event].forEach(function (fn) {
                fn.apply(_this, args);
            });
        };
        return EventHost;
    }(Base));

    var Bitstream = /** @class */ (function () {
        function Bitstream(stream) {
            this.stream = stream;
            this.bitPosition = 0;
        }
        Bitstream.prototype.copy = function () {
            var res = new Bitstream(this.stream.copy());
            res.bitPosition = this.bitPosition;
            return res;
        };
        Bitstream.prototype.offset = function () {
            return this.stream.offset * 8 + this.bitPosition;
        };
        Bitstream.prototype.available = function (bits) {
            return this.stream.available((bits + 8 - this.bitPosition) / 8);
        };
        Bitstream.prototype.advance = function (bits) {
            var pos = this.bitPosition + bits;
            this.stream.advance(pos >> 3);
            this.bitPosition = pos & 7;
        };
        Bitstream.prototype.rewind = function (bits) {
            var pos = this.bitPosition - bits;
            this.stream.rewind(Math.abs(pos >> 3));
            this.bitPosition = pos & 7;
        };
        Bitstream.prototype.seek = function (offset) {
            var curOffset = this.offset();
            if (offset > curOffset) {
                return this.advance(offset - curOffset);
            }
            else if (offset < curOffset) {
                return this.rewind(curOffset - offset);
            }
        };
        Bitstream.prototype.align = function () {
            if (this.bitPosition !== 0) {
                this.bitPosition = 0;
                this.stream.advance(1);
            }
        };
        Bitstream.prototype.read = function (bits, signed) {
            var res = this.peek(bits, signed);
            this.advance(bits);
            return res;
        };
        Bitstream.prototype.peek = function (bits, signed) {
            if (bits === 0) {
                return 0;
            }
            var mBits = bits + this.bitPosition;
            var a;
            if (mBits <= 8) {
                a = ((this.stream.peekUInt8() << this.bitPosition) & 0xff) >>> (8 - bits);
            }
            else if (mBits <= 16) {
                a = ((this.stream.peekUInt16() << this.bitPosition) & 0xffff) >>> (16 - bits);
            }
            else if (mBits <= 24) {
                a = ((this.stream.peekUInt24() << this.bitPosition) & 0xffffff) >>> (24 - bits);
            }
            else if (mBits <= 32) {
                a = (this.stream.peekUInt32() << this.bitPosition) >>> (32 - bits);
            }
            else if (mBits <= 40) {
                var a0 = this.stream.peekUInt8(0) * 0x0100000000;
                var a1 = this.stream.peekUInt8(1) << 24 >>> 0;
                var a2 = this.stream.peekUInt8(2) << 16;
                var a3 = this.stream.peekUInt8(3) << 8;
                var a4 = this.stream.peekUInt8(4);
                a = a0 + a1 + a2 + a3 + a4;
                a %= Math.pow(2, 40 - this.bitPosition);
                a = Math.floor(a / Math.pow(2, 40 - this.bitPosition - bits));
            }
            else {
                throw new Error('Too many bits!');
            }
            if (signed) {
                if (mBits < 32) {
                    if (a >>> (bits - 1)) {
                        a = ((1 << bits >>> 0) - a) * -1;
                    }
                }
                else {
                    if (a / Math.pow(2, bits - 1) | 0) {
                        a = (Math.pow(2, bits) - a) * -1;
                    }
                }
            }
            return a;
        };
        Bitstream.prototype.readLSB = function (bits, signed) {
            var res = this.peekLSB(bits, signed);
            this.advance(bits);
            return res;
        };
        Bitstream.prototype.peekLSB = function (bits, signed) {
            if (bits === 0) {
                return 0;
            }
            if (bits > 40) {
                throw new Error('Too many bits!');
            }
            var mBits = bits + this.bitPosition;
            var a = (this.stream.peekUInt8(0)) >>> this.bitPosition;
            if (mBits > 8) {
                a |= (this.stream.peekUInt8(1)) << (8 - this.bitPosition);
            }
            if (mBits > 16) {
                a |= (this.stream.peekUInt8(2)) << (16 - this.bitPosition);
            }
            if (mBits > 24) {
                a += (this.stream.peekUInt8(3)) << (24 - this.bitPosition) >>> 0;
            }
            if (mBits > 32) {
                a += (this.stream.peekUInt8(4)) * Math.pow(2, 32 - this.bitPosition);
            }
            if (mBits >= 32) {
                a %= Math.pow(2, bits);
            }
            else {
                a &= (1 << bits) - 1;
            }
            if (signed) {
                if (mBits < 32) {
                    if (a >>> (bits - 1)) {
                        a = ((1 << bits >>> 0) - a) * -1;
                    }
                }
                else {
                    if (a / Math.pow(2, bits - 1) | 0) {
                        a = (Math.pow(2, bits) - a) * -1;
                    }
                }
            }
            return a;
        };
        return Bitstream;
    }());

    var Stream = /** @class */ (function () {
        function Stream(list) {
            this.buf = new ArrayBuffer(16);
            this.uint8 = new Uint8Array(this.buf);
            this.int8 = new Int8Array(this.buf);
            this.uint16 = new Uint16Array(this.buf);
            this.int16 = new Int16Array(this.buf);
            this.uint32 = new Uint32Array(this.buf);
            this.int32 = new Int32Array(this.buf);
            this.float32 = new Float32Array(this.buf);
            this.float64 = (Float64Array) ? new Float64Array(this.buf) : null;
            // True if little endian
            this.nativeEndian = new Uint16Array(new Uint8Array([0x12, 0x34]).buffer)[0] === 0x3412;
            this.list = list;
            this.localOffset = 0;
            this.offset = 0;
        }
        Stream.fromBuffer = function (buffer) {
            var list = new BufferList();
            list.append(buffer);
            return new Stream(list);
        };
        Stream.prototype.copy = function () {
            var res = new Stream(this.list.copy());
            res.localOffset = this.localOffset;
            res.offset = this.offset;
            return res;
        };
        Stream.prototype.available = function (bytes) {
            return bytes <= this.remainingBytes();
        };
        Stream.prototype.remainingBytes = function () {
            return this.list.availableBytes - this.localOffset;
        };
        Stream.prototype.advance = function (bytes) {
            if (!this.available(bytes)) {
                throw new UnderflowError();
            }
            this.localOffset += bytes;
            this.offset += bytes;
            while (this.list.first && this.localOffset >= this.list.first.length) {
                this.localOffset -= this.list.first.length;
                this.list.advance();
            }
            return this;
        };
        Stream.prototype.rewind = function (bytes) {
            if (bytes > this.offset) {
                throw new UnderflowError();
            }
            if (!this.list.first) {
                this.list.rewind();
                this.localOffset = this.list.first.length;
            }
            this.localOffset -= bytes;
            this.offset -= bytes;
            while (this.list.first.prev && this.localOffset < 0) {
                this.list.rewind();
                this.localOffset += this.list.first.length;
            }
            return this;
        };
        Stream.prototype.seek = function (position) {
            if (position > this.offset) {
                this.advance(position - this.offset);
            }
            else if (position < this.offset) {
                this.rewind(this.offset - position);
            }
        };
        Stream.prototype.readUInt8 = function () {
            if (!this.available(1)) {
                throw new UnderflowError();
            }
            var a = this.list.first.data[this.localOffset];
            this.localOffset += 1;
            this.offset += 1;
            if (this.localOffset === this.list.first.length) {
                this.localOffset = 0;
                this.list.advance();
            }
            return a;
        };
        Stream.prototype.peekUInt8 = function (offset) {
            if (offset === void 0) { offset = 0; }
            if (!this.available(offset + 1)) {
                throw new UnderflowError();
            }
            offset = this.localOffset + offset;
            var buffer = this.list.first;
            while (buffer) {
                if (buffer.length > offset) {
                    return buffer.data[offset];
                }
                offset -= buffer.length;
                buffer = buffer.next;
            }
            // TODO: We should not be able to reach this should we ?
            return 0;
        };
        Stream.prototype.read = function (bytes, litteEndian) {
            if (!litteEndian) {
                litteEndian = false;
            }
            if (litteEndian === this.nativeEndian) {
                for (var i = 0; i < bytes; i++) {
                    this.uint8[i] = this.readUInt8();
                }
            }
            else {
                for (var i = 0; i < bytes; i++) {
                    this.uint8[bytes - i - 1] = this.readUInt8();
                }
            }
        };
        Stream.prototype.peek = function (bytes, offset, litteEndian) {
            if (!litteEndian) {
                litteEndian = false;
            }
            if (litteEndian === this.nativeEndian) {
                for (var i = 0; i < bytes; i++) {
                    this.uint8[i] = this.peekUInt8(offset + i);
                }
            }
            else {
                for (var i = 0; i < bytes; i++) {
                    this.uint8[bytes - i - 1] = this.peekUInt8(offset + i);
                }
            }
        };
        Stream.prototype.readInt8 = function () {
            this.read(1);
            return this.int8[0];
        };
        Stream.prototype.peekInt8 = function (offset) {
            if (!offset) {
                offset = 0;
            }
            this.peek(1, offset);
            return this.int8[0];
        };
        Stream.prototype.readUInt16 = function (litteEndian) {
            this.read(2, litteEndian);
            return this.uint16[0];
        };
        Stream.prototype.peekUInt16 = function (offset, litteEndian) {
            if (!offset) {
                offset = 0;
            }
            this.peek(2, offset, litteEndian);
            return this.uint16[0];
        };
        Stream.prototype.readInt16 = function (litteEndian) {
            this.read(2, litteEndian);
            return this.int16[0];
        };
        Stream.prototype.peekInt16 = function (offset, litteEndian) {
            if (!offset) {
                offset = 0;
            }
            this.peek(2, offset, litteEndian);
            return this.int16[0];
        };
        Stream.prototype.readUInt24 = function (litteEndian) {
            if (litteEndian) {
                return this.readUInt16(true) + (this.readUInt8() << 16);
            }
            else {
                return (this.readUInt16(false) << 8) + this.readUInt8();
            }
        };
        Stream.prototype.peekUInt24 = function (offset, litteEndian) {
            if (!offset) {
                offset = 0;
            }
            if (litteEndian) {
                return this.peekUInt16(offset, true) + (this.peekUInt8(offset + 2) << 16);
            }
            else {
                return (this.peekUInt16(offset) << 8) + this.peekUInt8(offset + 2);
            }
        };
        Stream.prototype.readInt24 = function (litteEndian) {
            if (litteEndian) {
                return this.readUInt16(true) + (this.readInt8() << 16);
            }
            else {
                return (this.readInt16(false) << 8) + this.readUInt8();
            }
        };
        Stream.prototype.peekInt24 = function (offset, litteEndian) {
            if (!offset) {
                offset = 0;
            }
            if (litteEndian) {
                return this.peekUInt16(offset, true) + (this.peekInt8(offset + 2) << 16);
            }
            else {
                return (this.peekInt16(offset) << 8) + this.peekUInt8(offset + 2);
            }
        };
        Stream.prototype.readUInt32 = function (litteEndian) {
            this.read(4, litteEndian);
            return this.uint32[0];
        };
        Stream.prototype.peekUInt32 = function (offset, litteEndian) {
            if (!offset) {
                offset = 0;
            }
            this.peek(4, offset, litteEndian);
            return this.uint32[0];
        };
        Stream.prototype.readInt32 = function (litteEndian) {
            this.read(4, litteEndian);
            return this.int32[0];
        };
        Stream.prototype.peekInt32 = function (offset, litteEndian) {
            if (!offset) {
                offset = 0;
            }
            this.peek(4, offset, litteEndian);
            return this.int32[0];
        };
        Stream.prototype.readFloat32 = function (litteEndian) {
            this.read(4, litteEndian);
            return this.float32[0];
        };
        Stream.prototype.peekFloat32 = function (offset, litteEndian) {
            if (!offset) {
                offset = 0;
            }
            this.peek(4, offset, litteEndian);
            return this.float32[0];
        };
        Stream.prototype.readFloat64 = function (litteEndian) {
            this.read(8, litteEndian);
            if (this.float64) {
                return this.float64[0];
            }
            else {
                return this.float64Fallback();
            }
        };
        Stream.prototype.peekFloat64 = function (offset, litteEndian) {
            if (!offset) {
                offset = 0;
            }
            this.peek(8, offset, litteEndian);
            if (this.float64) {
                return this.float64[0];
            }
            else {
                return this.float64Fallback();
            }
        };
        Stream.prototype.readFloat80 = function (littleEndian) {
            this.read(10, littleEndian);
            return this.float80();
        };
        Stream.prototype.peekFloat80 = function (offset, litteEndian) {
            if (!offset) {
                offset = 0;
            }
            this.peek(10, offset, litteEndian);
            return this.float80();
        };
        Stream.prototype.readBuffer = function (length) {
            var res = Buffer.allocate(length);
            var to = res.data;
            for (var i = 0; i < length; i++) {
                to[i] = this.readUInt8();
            }
            return res;
        };
        Stream.prototype.peekBuffer = function (offset, length) {
            var res = Buffer.allocate(length);
            var to = res.data;
            for (var i = 0; i < length; i++) {
                to[i] = this.peekUInt8(offset + i);
            }
            return res;
        };
        Stream.prototype.readSingleBuffer = function (length) {
            var res = this.list.first.slice(this.localOffset, length);
            this.advance(res.length);
            return res;
        };
        Stream.prototype.peekSingleBuffer = function (offset, length) {
            var res = this.list.first.slice(this.localOffset + offset, length);
            return res;
        };
        Stream.prototype.readString = function (length, encoding) {
            if (!encoding) {
                encoding = 'ascii';
            }
            return this.decodeString(0, length, encoding, true);
        };
        Stream.prototype.peekString = function (offset, length, encoding) {
            if (!encoding) {
                encoding = 'ascii';
            }
            return this.decodeString(offset, length, encoding, false);
        };
        Stream.prototype.float64Fallback = function () {
            var low = this.uint32[0];
            var high = this.uint32[1];
            if (high === 0 || high === 0x80000000) {
                return 0.0;
            }
            var sign = 1 - (high >>> 31) * 2;
            var exp = (high >>> 20) & 0x7ff;
            var frac = high & 0xffff;
            if (exp === 0x7ff) {
                if (frac) {
                    return NaN;
                }
                return Infinity * sign;
            }
            exp -= 1023;
            var out = (frac | 0x100000) * Math.pow(2, exp - 20);
            out += low * Math.pow(2, exp - 52);
            return sign * out;
        };
        Stream.prototype.decodeString = function (offset, length, encoding, advance) {
            encoding = encoding.toLowerCase();
            var nullEnd = (length === null) ? 0 : -1;
            if (!length) {
                length = Infinity;
            }
            var end = offset + length;
            var result = '';
            switch (encoding) {
                case 'ascii':
                case 'latin1':
                    var c = void 0;
                    while (offset < end && (c = this.peekUInt8(offset++)) !== nullEnd) {
                        result += String.fromCharCode(c);
                    }
                    break;
                case 'utf8':
                case 'utf-8':
                    var b1 = void 0;
                    while (offset < end && (b1 = this.peekUInt8(offset++)) !== nullEnd) {
                        if ((b1 & 0x80) === 0) {
                            result += String.fromCharCode(b1);
                            // one continuation (128 to 2047)
                        }
                        else if ((b1 & 0xe0) === 0xc0) {
                            var b2 = (this.peekUInt8(offset++) & 0x3f);
                            result += String.fromCharCode(((b1 & 0x1f) << 6) | b2);
                            // two continuation (2048 to 55295 and 57344 to 65535)
                        }
                        else if ((b1 & 0xf0) === 0xe0) {
                            var b2 = this.peekUInt8(offset++) & 0x3f;
                            var b3 = this.peekUInt8(offset++) & 0x3f;
                            result += String.fromCharCode(((b1 & 0x0f) << 12) | (b2 << 6) | b3);
                            // three continuation (65536 to 1114111)
                        }
                        else if ((b1 & 0xf8) === 0xf0) {
                            var b2 = this.peekUInt8(offset++) & 0x3f;
                            var b3 = this.peekUInt8(offset++) & 0x3f;
                            var b4 = this.peekUInt8(offset++) & 0x3f;
                            // split into a surrogate pair
                            var pt = (((b1 & 0x0f) << 18) | (b2 << 12) | (b3 << 6) | b4) - 0x10000;
                            result += String.fromCharCode(0xd800 + (pt >> 10), 0xdc00 + (pt & 0x3ff));
                        }
                    }
                    break;
                case 'utf16-be':
                case 'utf16be':
                case 'utf16le':
                case 'utf16-le':
                case 'utf16bom':
                case 'utf16-bom':
                    // find endianness
                    var littleEndian = false;
                    switch (encoding) {
                        case 'utf16le':
                        case 'utf16-le':
                            littleEndian = true;
                            break;
                        case 'utf16bom':
                        case 'utf16-bom':
                            var bom = void 0;
                            if (length < 2 || (bom = this.peekUInt16(offset)) === nullEnd) {
                                offset += 2;
                                if (advance) {
                                    this.advance(offset);
                                }
                                return result;
                            }
                            littleEndian = (bom === 0xfffe);
                            offset += 2;
                    }
                    var w1 = void 0;
                    while (offset < end && (w1 = this.peekUInt16(offset, littleEndian)) !== nullEnd) {
                        offset += 2;
                        if (w1 < 0xd800 || w1 > 0xdfff) {
                            result += String.fromCharCode(w1);
                        }
                        else {
                            if (w1 > 0xdbff) {
                                throw new Error('Invalid utf16 sequence.');
                            }
                            var w2 = this.peekUInt16(offset, littleEndian);
                            if (w2 < 0xdc00 || w2 > 0xdfff) {
                                throw new Error('Invalid utf16 sequence.');
                            }
                            result += String.fromCharCode(w1, w2);
                            offset += 2;
                        }
                    }
                    if (w1 === nullEnd) {
                        offset += 2;
                    }
                    break;
                default:
                    throw new Error('Unknown encoding: ' + encoding);
            }
            if (advance) {
                this.advance(offset);
            }
            return result;
        };
        Stream.prototype.float80 = function () {
            var high = this.uint32[0];
            var low = this.uint32[1];
            var a0 = this.uint8[9];
            var a1 = this.uint8[8];
            var sign = 1 - (a0 >>> 7) * 2;
            var exp = ((a0 & 0x7F) << 8) | a1;
            if (exp === 0 && low === 0 && high === 0) {
                return 0;
            }
            if (exp === 0x7fff) {
                if (low === 0 && high === 0) {
                    return sign * Infinity;
                }
                else {
                    return NaN;
                }
            }
            exp -= 16383;
            var out = low * Math.pow(2, exp - 31);
            out += high * Math.pow(2, exp - 63);
            return sign * out;
        };
        return Stream;
    }());

    var SeekPoint = /** @class */ (function () {
        function SeekPoint(offset, timestamp) {
            this.offset = offset || 0;
            this.timestamp = timestamp || 0;
        }
        return SeekPoint;
    }());

    var __extends$h = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var Demuxer = /** @class */ (function (_super) {
        __extends$h(Demuxer, _super);
        function Demuxer(source, chunk) {
            var _this = _super.call(this) || this;
            var list = new BufferList();
            list.append(chunk);
            _this.stream = new Stream(list);
            _this.source = source;
            var received = false;
            _this.source.on('data', function (c) {
                received = true;
                list.append(c);
                try {
                    _this.readChunk();
                }
                catch (e) {
                    _this.emit('error', e);
                }
            });
            _this.source.on('error', function (err) {
                _this.emit('error', err);
            });
            _this.source.on('end', function () {
                if (!received) {
                    _this.readChunk();
                }
                _this.emit('end');
            });
            _this.seekPoints = [];
            _this.init();
            return _this;
        }
        Demuxer.register = function (demuxer) {
            this.demuxers.push(demuxer);
        };
        Demuxer.find = function (buffer) {
            var stream = Stream.fromBuffer(buffer);
            for (var _i = 0, _a = this.demuxers; _i < _a.length; _i++) {
                var format = _a[_i];
                var offset = stream.offset;
                try {
                    if (format.probe(stream)) {
                        return format;
                    }
                }
                catch (e) {
                    console.error(e);
                }
                stream.seek(offset);
            }
            return null;
        };
        Demuxer.prototype.addSeekPoint = function (offset, timestamp) {
            var index = this.searchTimestamp(timestamp);
            this.seekPoints.splice(index, 0, new SeekPoint(offset, timestamp));
        };
        Demuxer.prototype.searchTimestamp = function (timestamp, backward) {
            var low = 0;
            var high = this.seekPoints.length;
            if (high > 0 && this.seekPoints[high - 1].timestamp < timestamp) {
                return high;
            }
            while (low < high) {
                var mid = (low + high) >> 1;
                var time = this.seekPoints[mid].timestamp;
                if (time < timestamp) {
                    low = mid + 1;
                }
                else if (time >= timestamp) {
                    high = mid;
                }
            }
            if (high > this.seekPoints.length) {
                high = this.seekPoints.length;
            }
            return high;
        };
        Demuxer.prototype.seek = function (timestamp) {
            if (this.format && this.format.framesPerPacket > 0 && this.format.bytesPerPacket > 0) {
                return new SeekPoint(this.format.bytesPerPacket * timestamp / this.format.framesPerPacket, timestamp);
            }
            else {
                var idx = this.searchTimestamp(timestamp);
                return this.seekPoints[idx];
            }
        };
        Demuxer.demuxers = [];
        return Demuxer;
    }(EventHost));

    var __extends$g = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var WAVEDemuxer = /** @class */ (function (_super) {
        __extends$g(WAVEDemuxer, _super);
        function WAVEDemuxer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        WAVEDemuxer.probe = function (stream) {
            return stream.peekString(0, 4) === 'RIFF' && stream.peekString(8, 4) === 'WAVE';
        };
        WAVEDemuxer.prototype.init = function () {
        };
        WAVEDemuxer.prototype.readChunk = function () {
            if (!this.readStart && this.stream.available(12)) {
                if (this.stream.readString(4) !== 'RIFF') {
                    return this.emit('error', 'Invalid WAV file.');
                }
                this.fileSize = this.stream.readUInt32(true);
                this.readStart = true;
                if (this.stream.readString(4) !== 'WAVE') {
                    return this.emit('error', 'Invalid WAV file.');
                }
            }
            while (this.stream.available(1)) {
                if (!this.readHeaders && this.stream.available(8)) {
                    this.type = this.stream.readString(4);
                    this.len = this.stream.readUInt32(true);
                }
                switch (this.type) {
                    case 'fmt ':
                        var encoding = this.stream.readUInt16(true);
                        if (!WAVEDemuxer.formats[encoding]) {
                            return this.emit('error', 'Unsupported format in WAV file.');
                        }
                        this.format = {
                            formatID: WAVEDemuxer.formats[encoding],
                            floatingPoint: encoding === 0x0003,
                            littleEndian: WAVEDemuxer.formats[encoding] === 'lpcm',
                            channelsPerFrame: this.stream.readUInt16(true),
                            sampleRate: this.stream.readUInt32(true),
                            framesPerPacket: 1
                        };
                        this.stream.advance(4); // bytes/sec
                        this.stream.advance(2); // block align
                        this.format.bitsPerChannel = this.stream.readUInt16(true);
                        this.format.bytesPerPacket = (this.format.bitsPerChannel / 8) * this.format.channelsPerFrame;
                        this.emit('format', this.format);
                        this.stream.advance(this.len - 16);
                        break;
                    case 'data':
                        if (!this.sentDuration) {
                            var bytes = this.format.bitsPerChannel / 8;
                            this.emit('duration', this.len / bytes / this.format.channelsPerFrame / this.format.sampleRate * 1000 | 0);
                            this.sentDuration = true;
                        }
                        var buffer = this.stream.readSingleBuffer(this.len);
                        this.len -= buffer.length;
                        this.readHeaders = this.len > 0;
                        this.emit('data', buffer);
                        break;
                    default:
                        if (!this.stream.available(this.len)) {
                            return;
                        }
                        this.stream.advance(this.len);
                        break;
                }
                if (this.type !== 'data') {
                    this.readHeaders = false;
                }
            }
        };
        WAVEDemuxer.formats = {
            0x0001: 'lpcm',
            0x0003: 'lpcm',
            0x0006: 'alaw',
            0x0007: 'ulaw'
        };
        return WAVEDemuxer;
    }(Demuxer));
    Demuxer.register(WAVEDemuxer);

    var __extends$f = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var AUDemuxer = /** @class */ (function (_super) {
        __extends$f(AUDemuxer, _super);
        function AUDemuxer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        AUDemuxer.probe = function (buffer) {
            return (buffer.peekString(0, 4) === '.snd');
        };
        AUDemuxer.prototype.init = function () {
        };
        AUDemuxer.prototype.readChunk = function () {
            if (!this.readHeader && this.stream.available(24)) {
                if (this.stream.readString(4) !== '.snd') {
                    return this.emit('error', 'Invalid AU file.');
                }
                this.stream.readUInt32();
                var dataSize = this.stream.readUInt32();
                var encoding = this.stream.readUInt32();
                this.format = {
                    formatID: AUDemuxer.formats[encoding] || 'lpcm',
                    littleEndian: false,
                    floatingPoint: encoding === 6 || encoding === 7,
                    bitsPerChannel: AUDemuxer.bps[encoding - 1],
                    sampleRate: this.stream.readUInt32(),
                    channelsPerFrame: this.stream.readUInt32(),
                    framesPerPacket: 1
                };
                if (!this.format.bitsPerChannel) {
                    return this.emit('error', 'Unsupported encoding in AU file.');
                }
                this.format.bytesPerPacket = (this.format.bitsPerChannel / 8) * this.format.channelsPerFrame;
                if (dataSize !== 0xffffffff) {
                    var bytes = this.format.bitsPerChannel / 8;
                    this.emit('duration', dataSize / bytes / this.format.channelsPerFrame / this.format.sampleRate * 1000 | 0);
                }
                this.emit('format', this.format);
                this.readHeader = true;
            }
            if (this.readHeader) {
                while (this.stream.available(1)) {
                    this.emit('data', this.stream.readSingleBuffer(this.stream.remainingBytes()));
                }
            }
        };
        AUDemuxer.bps = {
            0: 8,
            1: 8,
            2: 16,
            3: 24,
            4: 32,
            5: 32,
            6: 64,
            26: 8
        };
        AUDemuxer.formats = {
            1: 'ulaw',
            27: 'alaw'
        };
        return AUDemuxer;
    }(Demuxer));
    Demuxer.register(AUDemuxer);

    var __extends$e = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var AIFFDemuxer = /** @class */ (function (_super) {
        __extends$e(AIFFDemuxer, _super);
        function AIFFDemuxer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        AIFFDemuxer.probe = function (buffer) {
            var s = buffer.peekString(8, 4);
            return buffer.peekString(0, 4) === 'FORM' && (s === 'AIFF' || s === 'AIFC');
        };
        AIFFDemuxer.prototype.init = function () {
        };
        AIFFDemuxer.prototype.readChunk = function () {
            if (!this.readStart && this.stream.available(12)) {
                if (this.stream.readString(4) !== 'FORM') {
                    return this.emit('error', 'Invalid AIFF.');
                }
                this.fileSize = this.stream.readUInt32();
                this.fileType = this.stream.readString(4);
                this.readStart = true;
                if (this.fileType !== 'AIFF' && this.fileType !== 'AIFC') {
                    return this.emit('error', 'Invalid AIFF.');
                }
            }
            while (this.stream.available(1)) {
                if (!this.readHeaders && this.stream.available(8)) {
                    this.type = this.stream.readString(4);
                    this.len = this.stream.readUInt32();
                }
                switch (this.type) {
                    case 'COMM':
                        if (!this.stream.available(this.len)) {
                            return;
                        }
                        this.format = {
                            formatID: 'lpcm',
                            channelsPerFrame: this.stream.readUInt16(),
                            sampleCount: this.stream.readUInt32(),
                            bitsPerChannel: this.stream.readUInt16(),
                            sampleRate: this.stream.readFloat80(),
                            framesPerPacket: 1,
                            littleEndian: false,
                            floatingPoint: false
                        };
                        this.format.bytesPerPacket = (this.format.bitsPerChannel / 8) * this.format.channelsPerFrame;
                        if (this.fileType === 'AIFC') {
                            var format = this.stream.readString(4);
                            this.format.littleEndian = format === 'sowt' && this.format.bitsPerChannel > 8;
                            this.format.floatingPoint = format === 'fl32' || format === 'fl64';
                            if (['twos', 'sowt', 'fl32', 'fl64', 'NONE'].indexOf(format) !== -1) {
                                format = 'lpcm';
                            }
                            this.format.formatID = format;
                            this.len -= 4;
                        }
                        this.stream.advance(this.len - 18);
                        this.emit('format', this.format);
                        this.emit('duration', this.format.sampleCount / this.format.sampleRate * 1000 | 0);
                        break;
                    case 'SSND':
                        if (!(this.readSSNDHeader && this.stream.available(4))) {
                            var offset = this.stream.readUInt32();
                            this.stream.advance(4); // skip block size
                            this.stream.advance(offset); // skip to data
                            this.readSSNDHeader = true;
                        }
                        var buffer = this.stream.readSingleBuffer(this.len);
                        this.len -= buffer.length;
                        this.readHeaders = this.len > 0;
                        this.emit('data', buffer);
                        break;
                    default:
                        if (!this.stream.available(this.len)) {
                            return;
                        }
                        this.stream.advance(this.len);
                }
                if (this.type !== 'SSND') {
                    this.readHeaders = false;
                }
            }
        };
        return AIFFDemuxer;
    }(Demuxer));
    Demuxer.register(AIFFDemuxer);

    var __extends$d = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var Decoder = /** @class */ (function (_super) {
        __extends$d(Decoder, _super);
        function Decoder(demuxer, format) {
            var _this = _super.call(this) || this;
            _this.demuxer = demuxer;
            _this.format = format;
            var list = new BufferList();
            _this.stream = new Stream(list);
            _this.bitstream = new Bitstream(_this.stream);
            _this.receivedFinalBuffer = false;
            _this.waiting = false;
            _this.demuxer.on('cookie', function (cookie) {
                try {
                    _this.setCookie(cookie);
                }
                catch (error) {
                    _this.emit('error', error);
                }
            });
            _this.demuxer.on('data', function (chunk) {
                list.append(chunk);
                if (_this.waiting) {
                    _this.decode();
                }
            });
            _this.demuxer.on('end', function () {
                _this.receivedFinalBuffer = true;
                if (_this.waiting) {
                    _this.decode();
                }
            });
            _this.init();
            return _this;
        }
        Decoder.register = function (id, decoder) {
            this.codecs[id] = decoder;
        };
        Decoder.find = function (id) {
            return this.codecs[id] || null;
        };
        Decoder.prototype.decode = function () {
            this.waiting = !this.receivedFinalBuffer;
            var offset = this.bitstream.offset();
            var packet;
            try {
                packet = this.readChunk();
            }
            catch (error) {
                if (!(error instanceof UnderflowError)) {
                    this.emit('error', error);
                    return false;
                }
            }
            if (packet) {
                this.emit('data', packet);
                if (this.receivedFinalBuffer) {
                    this.emit('end');
                }
                return true;
            }
            else if (!this.receivedFinalBuffer) {
                this.bitstream.seek(offset);
                this.waiting = true;
            }
            else {
                this.emit('end');
            }
            return false;
        };
        Decoder.prototype.seek = function (timestamp) {
            var seekPoint = this.demuxer.seek(timestamp);
            this.stream.seek(seekPoint.offset);
            return seekPoint.timestamp;
        };
        Decoder.codecs = {};
        return Decoder;
    }(EventHost));

    var __extends$c = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var LPCMDecoder = /** @class */ (function (_super) {
        __extends$c(LPCMDecoder, _super);
        function LPCMDecoder() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        LPCMDecoder.prototype.init = function () { };
        LPCMDecoder.prototype.setCookie = function (cookie) { };
        LPCMDecoder.prototype.readChunk = function () {
            var stream = this.stream;
            var littleEndian = this.format.littleEndian;
            var chunkSize = Math.min(4096, stream.remainingBytes());
            var samples = chunkSize / (this.format.bitsPerChannel / 8) | 0;
            var output = null;
            if (chunkSize < this.format.bitsPerChannel / 8) {
                return null;
            }
            if (this.format.floatingPoint) {
                switch (this.format.bitsPerChannel) {
                    case 32:
                        output = new Float32Array(samples);
                        for (var i = 0; i < samples; i++) {
                            output[i] = stream.readFloat32(littleEndian);
                        }
                        break;
                    case 64:
                        output = new Float64Array(samples);
                        for (var i = 0; i < samples; i++) {
                            output[i] = stream.readFloat64(littleEndian);
                        }
                        break;
                    default:
                        throw new Error('Unsupported bit depth.');
                }
            }
            else {
                switch (this.format.bitsPerChannel) {
                    case 8:
                        output = new Int8Array(samples);
                        for (var i = 0; i < samples; i++) {
                            output[i] = stream.readInt8();
                        }
                        break;
                    case 16:
                        output = new Int16Array(samples);
                        for (var i = 0; i < samples; i++) {
                            output[i] = stream.readInt16(littleEndian);
                        }
                        break;
                    case 24:
                        output = new Int32Array(samples);
                        for (var i = 0; i < samples; i++) {
                            output[i] = stream.readInt24(littleEndian);
                        }
                        break;
                    case 32:
                        output = new Int32Array(samples);
                        for (var i = 0; i < samples; i++) {
                            output[i] = stream.readInt32(littleEndian);
                        }
                        break;
                    default:
                        throw new Error('Unsupported bit depth.');
                }
            }
            return output;
        };
        return LPCMDecoder;
    }(Decoder));
    Decoder.register('lpcm', LPCMDecoder);

    var __extends$b = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var XLAWDecoder = /** @class */ (function (_super) {
        __extends$b(XLAWDecoder, _super);
        function XLAWDecoder() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        XLAWDecoder.prototype.setCookie = function (cookie) { };
        XLAWDecoder.prototype.init = function () {
            this.format.bitsPerChannel = 16;
            this.table = new Int16Array(256);
            if (this.format.formatID === 'ulaw') {
                for (var i = 0; i < this.table.length; i++) {
                    // Complement to obtain normal u-law value.
                    var val = ~i;
                    // Extract and bias the quantization bits. Then
                    // shift up by the segment number and subtract out the bias.
                    var t = ((val & XLAWDecoder.quantMask) << 3) + XLAWDecoder.bias;
                    t <<= (val & XLAWDecoder.segMask) >>> XLAWDecoder.segShift;
                    this.table[i] = (val & XLAWDecoder.signBit) ? (XLAWDecoder.bias - t) : (t - XLAWDecoder.bias);
                }
            }
            else {
                for (var i = 0; i < this.table.length; i++) {
                    var val = i ^ 0x55;
                    var t = val & XLAWDecoder.quantMask;
                    var seg = (val & XLAWDecoder.segMask) >>> XLAWDecoder.segShift;
                    if (seg) {
                        t = (t + t + 1 + 32) << (seg + 2);
                    }
                    else {
                        t = (t + t + 1) << 3;
                    }
                    this.table[i] = (val & XLAWDecoder.signBit) ? t : -t;
                }
            }
        };
        XLAWDecoder.prototype.readChunk = function () {
            var samples = Math.min(4096, this.stream.remainingBytes());
            if (samples === 0) {
                return null;
            }
            var output = new Int16Array(samples);
            for (var i = 0; i < samples; i++) {
                output[i] = this.table[this.stream.readUInt8()];
            }
            return output;
        };
        XLAWDecoder.signBit = 0x80;
        XLAWDecoder.quantMask = 0xf;
        XLAWDecoder.segShift = 4;
        XLAWDecoder.segMask = 0x70;
        XLAWDecoder.bias = 0x84;
        return XLAWDecoder;
    }(Decoder));
    Decoder.register('ulaw', XLAWDecoder);
    Decoder.register('alaw', XLAWDecoder);

    var __extends$a = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var AudioDeviceBackend = /** @class */ (function (_super) {
        __extends$a(AudioDeviceBackend, _super);
        function AudioDeviceBackend() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return AudioDeviceBackend;
    }(EventHost));

    var __extends$9 = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var AudioDevice = /** @class */ (function (_super) {
        __extends$9(AudioDevice, _super);
        function AudioDevice(sampleRate, channels) {
            var _this = _super.call(this) || this;
            _this.sampleRate = sampleRate;
            _this.channels = channels;
            _this.playing = false;
            _this.currentTime = 0;
            _this._lastTime = 0;
            return _this;
        }
        AudioDevice.register = function (device) {
            this.devices.push(device);
        };
        AudioDevice.create = function (sampleRate, channels) {
            for (var _i = 0, _a = this.devices; _i < _a.length; _i++) {
                var device = _a[_i];
                if (device.supported) {
                    return new device(sampleRate, channels);
                }
            }
            return null;
        };
        AudioDevice.prototype.start = function () {
            var _this = this;
            if (this.playing) {
                return;
            }
            this.playing = true;
            if (!this.device) {
                this.device = AudioDevice.create(this.sampleRate, this.channels);
            }
            if (!this.device) {
                throw new Error('No supported audio device found.');
            }
            this._lastTime = this.device.getDeviceTime();
            this._timer = setInterval(this.updateTime.bind(this), 200);
            this.refill = function (buffer) {
                _this.emit('refill', buffer);
            };
            this.device.on('refill', this.refill);
        };
        AudioDevice.prototype.stop = function () {
            if (!this.playing) {
                return;
            }
            this.playing = false;
            if (this.device) {
                this.device.off('refill', this.refill);
            }
            clearInterval(this._timer);
        };
        AudioDevice.prototype.destroy = function () {
            this.stop();
            if (this.device) {
                this.device.destroy();
            }
        };
        AudioDevice.prototype.seek = function (cTime) {
            this.currentTime = cTime;
            if (this.playing) {
                this._lastTime = this.device.getDeviceTime();
            }
            this.emit('timeUpdate', this.currentTime);
        };
        AudioDevice.prototype.updateTime = function () {
            var time = this.device.getDeviceTime();
            this.currentTime += (time - this._lastTime) / this.device.sampleRate * 1000 | 0;
            this._lastTime = time;
            this.emit('timeUpdate', this.currentTime);
        };
        AudioDevice.devices = [];
        return AudioDevice;
    }(EventHost));

    // JavaScript Audio Resampler
    // Copyright (C) 2011-2015 Grant Galitz
    // Released to Public Domain
    // Ported to Typescript by Dominik Thalhammer, 2019
    var Resampler = /** @class */ (function () {
        function Resampler(fromSampleRate, toSampleRate, channels, inputBufferLength) {
            this.fromSampleRate = fromSampleRate;
            this.toSampleRate = toSampleRate;
            this.channels = channels;
            this.inputBufferLength = inputBufferLength;
            if (!this.channels) {
                this.channels = 0;
            }
            if (!(this.fromSampleRate > 0 && this.toSampleRate > 0 && this.channels > 0)) {
                throw (new Error('Invalid settings specified for the resampler.'));
            }
            this.initialize();
        }
        Resampler.prototype.initialize = function () {
            // Perform some checks:
            if (this.fromSampleRate === this.toSampleRate) {
                // Setup a resampler bypass:
                this.resampler = this.bypassResampler; // Resampler just returns what was passed through.
                this.ratioWeight = 1;
            }
            else {
                this.ratioWeight = this.fromSampleRate / this.toSampleRate;
                if (this.fromSampleRate < this.toSampleRate) {
                    /*
                      Use generic linear interpolation if upsampling,
                      as linear interpolation produces a gradient that we want
                      and works fine with two input sample points per output in this case.
                    */
                    this.compileLinearInterpolationFunction();
                    this.lastWeight = 1;
                }
                else {
                    /*
                      Custom resampler I wrote that doesn't skip samples
                      like standard linear interpolation in high downsampling.
                      This is more accurate than linear interpolation on downsampling.
                    */
                    this.compileMultiTapFunction();
                    this.tailExists = false;
                    this.lastWeight = 0;
                }
                var ceil = Math.ceil(this.inputBufferLength * this.toSampleRate / this.fromSampleRate / this.channels * 1.01);
                var outputBufferSize = (ceil * this.channels) + this.channels;
                this.outputBuffer = new Float32Array(outputBufferSize);
                this.lastOutput = new Float32Array(this.channels);
            }
        };
        Resampler.prototype.bypassResampler = function (inputBuffer) {
            return inputBuffer;
        };
        Resampler.prototype.compileLinearInterpolationFunction = function () {
            var toCompile = 'var outputOffset = 0;\
          var bufferLength = buffer.length;\
          if (bufferLength > 0) {\
            var weight = this.lastWeight;\
            var firstWeight = 0;\
            var secondWeight = 0;\
            var sourceOffset = 0;\
            var outputOffset = 0;\
            var outputBuffer = this.outputBuffer;\
            for (; weight < 1; weight += ' + this.ratioWeight + ') {\
              secondWeight = weight % 1;\
              firstWeight = 1 - secondWeight;';
            for (var channel = 0; channel < this.channels; ++channel) {
                toCompile += 'outputBuffer[outputOffset++] = (this.lastOutput[' + channel + '] '
                    + '* firstWeight) + (buffer[' + channel + '] * secondWeight);';
            }
            toCompile += '}\
            weight -= 1;\
            for (bufferLength -= ' + this.channels + ', sourceOffset = Math.floor(weight) * '
                + this.channels + '; sourceOffset < bufferLength;) {\
              secondWeight = weight % 1;\
              firstWeight = 1 - secondWeight;';
            for (var channel = 0; channel < this.channels; ++channel) {
                toCompile += 'outputBuffer[outputOffset++] = (buffer[sourceOffset'
                    + ((channel > 0) ? (' + ' + channel) : '')
                    + '] * firstWeight) + (buffer[sourceOffset + ' + (this.channels + channel) + '] * secondWeight);';
            }
            toCompile += 'weight += ' + this.ratioWeight + ';\
              sourceOffset = Math.floor(weight) * ' + this.channels + ';\
            }';
            for (var channel = 0; channel < this.channels; ++channel) {
                toCompile += 'this.lastOutput[' + channel + '] = buffer[sourceOffset++];';
            }
            toCompile += 'this.lastWeight = weight % 1;\
          }\
          return this.outputBuffer;';
            this.resampler = Function('buffer', toCompile);
        };
        Resampler.prototype.compileMultiTapFunction = function () {
            var toCompile = 'var outputOffset = 0;\
          var bufferLength = buffer.length;\
          if (bufferLength > 0) {\
            var weight = 0;';
            for (var channel = 0; channel < this.channels; ++channel) {
                toCompile += 'var output' + channel + ' = 0;';
            }
            toCompile += 'var actualPosition = 0;\
            var amountToNext = 0;\
            var alreadyProcessedTail = !this.tailExists;\
            this.tailExists = false;\
            var outputBuffer = this.outputBuffer;\
            var currentPosition = 0;\
            do {\
              if (alreadyProcessedTail) {\
                weight = ' + this.ratioWeight + ';';
            for (var channel = 0; channel < this.channels; ++channel) {
                toCompile += 'output' + channel + ' = 0;';
            }
            toCompile += '}\
              else {\
                weight = this.lastWeight;';
            for (var channel = 0; channel < this.channels; ++channel) {
                toCompile += 'output' + channel + ' = this.lastOutput[' + channel + '];';
            }
            toCompile += 'alreadyProcessedTail = true;\
              }\
              while (weight > 0 && actualPosition < bufferLength) {\
                amountToNext = 1 + actualPosition - currentPosition;\
                if (weight >= amountToNext) {';
            for (var channel = 0; channel < this.channels; ++channel) {
                toCompile += 'output' + channel + ' += buffer[actualPosition++] * amountToNext;';
            }
            toCompile += 'currentPosition = actualPosition;\
                  weight -= amountToNext;\
                }\
                else {';
            for (var channel = 0; channel < this.channels; ++channel) {
                toCompile += 'output' + channel + ' += buffer[actualPosition' + ((channel > 0) ? (' + ' + channel) : '') + '] * weight;';
            }
            toCompile += 'currentPosition += weight;\
                  weight = 0;\
                  break;\
                }\
              }\
              if (weight <= 0) {';
            for (var channel = 0; channel < this.channels; ++channel) {
                toCompile += 'outputBuffer[outputOffset++] = output' + channel + ' / ' + this.ratioWeight + ';';
            }
            toCompile += '}\
              else {\
                this.lastWeight = weight;';
            for (var channel = 0; channel < this.channels; ++channel) {
                toCompile += 'this.lastOutput[' + channel + '] = output' + channel + ';';
            }
            toCompile += 'this.tailExists = true;\
                break;\
              }\
            } while (actualPosition < bufferLength);\
          }\
          return this.outputBuffer;';
            this.resampler = Function('buffer', toCompile);
        };
        return Resampler;
    }());

    var __extends$8 = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var WebAudioDevice = /** @class */ (function (_super) {
        __extends$8(WebAudioDevice, _super);
        function WebAudioDevice(sampleRate, channels) {
            var _this = _super.call(this) || this;
            _this.resampler = null;
            WebAudioDevice.sharedContext = WebAudioDevice.sharedContext || new WebAudioDevice.contextClass();
            _this.context = WebAudioDevice.sharedContext;
            _this.deviceSampleRate = _this.context.sampleRate;
            _this.sampleRate = sampleRate;
            _this.channels = channels;
            _this.bufferSize = Math.ceil(4096 / (_this.deviceSampleRate / _this.sampleRate) * _this.channels);
            _this.bufferSize += _this.bufferSize % _this.channels;
            if (_this.deviceSampleRate !== _this.sampleRate) {
                _this.resampler = new Resampler(_this.sampleRate, _this.deviceSampleRate, _this.channels, _this.bufferSize);
            }
            _this.node = _this.context['createScriptProcessor'](4096, _this.channels, _this.channels);
            _this.node.onaudioprocess = _this.refill.bind(_this);
            _this.node.connect(_this.context.destination);
            return _this;
        }
        WebAudioDevice.prototype.refill = function (event) {
            var outputBuffer = event.outputBuffer;
            var channelCount = outputBuffer.numberOfChannels;
            var channels = new Array(channelCount);
            for (var i = 0; i < channelCount; i++) {
                channels[i] = outputBuffer.getChannelData(i);
            }
            var data = new Float32Array(this.bufferSize);
            this.emit('refill', data);
            if (this.resampler) {
                data = this.resampler.resampler(data);
            }
            for (var i = 0; i < outputBuffer.length; i++) {
                for (var n = 0; n < channelCount; n++) {
                    channels[n][i] = data[i * channelCount + n];
                }
            }
        };
        WebAudioDevice.prototype.destroy = function () {
            this.node.disconnect(0);
        };
        WebAudioDevice.prototype.getDeviceTime = function () {
            return this.context.currentTime * this.sampleRate;
        };
        WebAudioDevice.contextClass = window.AudioContext || window.webkitAudioContext;
        WebAudioDevice.supported = WebAudioDevice.contextClass;
        WebAudioDevice.sharedContext = null;
        return WebAudioDevice;
    }(AudioDeviceBackend));
    AudioDevice.register(WebAudioDevice);

    var Filter = /** @class */ (function () {
        function Filter(context, key) {
            this.context = context;
            this.key = key;
        }
        Object.defineProperty(Filter.prototype, "value", {
            get: function () {
                return this.context[this.key];
            },
            enumerable: false,
            configurable: true
        });
        return Filter;
    }());

    var __extends$7 = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var BalanceFilter = /** @class */ (function (_super) {
        __extends$7(BalanceFilter, _super);
        function BalanceFilter() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        BalanceFilter.prototype.process = function (buffer) {
            if (this.value === 0) {
                return;
            }
            if (buffer.length % 2 !== 0) {
                throw new Error('Odd buffer passed to balance filter');
            }
            var pan = Math.max(-50, Math.min(50, this.value));
            var panL = Math.min(1, (50 - pan) / 50);
            var panR = Math.min(1, (50 + pan) / 50);
            for (var i = 0; i < buffer.length; i += 2) {
                buffer[i] *= panL;
                buffer[i + 1] *= panR;
            }
        };
        return BalanceFilter;
    }(Filter));

    var __extends$6 = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var VolumeFilter = /** @class */ (function (_super) {
        __extends$6(VolumeFilter, _super);
        function VolumeFilter() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        VolumeFilter.prototype.process = function (buffer) {
            if (this.value >= 100) {
                return;
            }
            var vol = Math.max(0, Math.min(100, this.value)) / 100;
            for (var i = 0; i < buffer.length; i++) {
                buffer[i] *= vol;
            }
        };
        return VolumeFilter;
    }(Filter));

    var __extends$5 = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var BufferSource = /** @class */ (function (_super) {
        __extends$5(BufferSource, _super);
        function BufferSource(input) {
            var _this = _super.call(this) || this;
            if (input instanceof BufferList) {
                _this.list = input;
            }
            else {
                _this.list = new BufferList();
                _this.list.append(new Buffer(input));
            }
            _this.paused = true;
            return _this;
        }
        BufferSource.prototype.start = function () {
            this.paused = false;
            this._timer = this.setImmediate(this.loop.bind(this));
        };
        BufferSource.prototype.loop = function () {
            this.emit('progress', ((this.list.numBuffers - this.list.availableBuffers + 1) / this.list.numBuffers * 100) | 0);
            this.emit('data', this.list.first);
            if (this.list.advance()) {
                this.setImmediate(this.loop.bind(this));
            }
            else {
                this.emit('end');
            }
        };
        BufferSource.prototype.pause = function () {
            this.clearImmediate(this._timer);
            this.paused = true;
        };
        BufferSource.prototype.reset = function () {
            this.pause();
            this.list.rewind();
        };
        BufferSource.prototype.setImmediate = function (fn) {
            if (global.setImmediate) {
                return global.setImmediate(fn);
            }
            else {
                return global.setTimeout(fn, 0);
            }
        };
        BufferSource.prototype.clearImmediate = function (timer) {
            if (global.clearImmediate) {
                return global.clearImmediate(timer);
            }
            else {
                return global.clearTimeout(timer);
            }
        };
        return BufferSource;
    }(EventHost));

    var __extends$4 = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var FileSource = /** @class */ (function (_super) {
        __extends$4(FileSource, _super);
        function FileSource(filename) {
            var _this = _super.call(this) || this;
            _this.filename = filename;
            _this.stream = null;
            _this.loaded = null;
            _this.size = null;
            return _this;
        }
        FileSource.prototype.start = function () {
            var _this = this;
            if (!this.size) {
                return this.getSize();
            }
            if (this.stream) {
                return this.stream.resume();
            }
            this.stream = fs__namespace.createReadStream(this.filename);
            this.stream.on('data', function (buf) {
                _this.loaded += buf.length;
                _this.emit('progress', _this.loaded / _this.size * 100);
                _this.emit('data', new Buffer(new Uint8Array(buf)));
            });
            this.stream.on('end', function () {
                _this.emit('end');
            });
            this.stream.on('error', function (err) {
                _this.pause();
                _this.emit('error', err);
            });
        };
        FileSource.prototype.pause = function () {
            if (this.stream) {
                this.stream.pause();
            }
        };
        FileSource.prototype.getSize = function () {
            var _this = this;
            fs__namespace.stat(this.filename, function (err, stat) {
                if (err) {
                    return _this.emit('error', err);
                }
                _this.size = stat.size;
                _this.start();
            });
        };
        return FileSource;
    }(EventHost));

    var __extends$3 = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var HTTPSource = /** @class */ (function (_super) {
        __extends$3(HTTPSource, _super);
        function HTTPSource(url, opts) {
            var _this = _super.call(this) || this;
            _this.url = url;
            _this.opts = opts;
            _this.request = null;
            _this.response = null;
            _this.loaded = 0;
            _this.size = 0;
            return _this;
        }
        HTTPSource.prototype.start = function () {
            var _this = this;
            if (this.response) {
                return this.response.resume();
            }
            this.request = http__namespace.get(this.url);
            this.request.on('response', function (resp) {
                _this.response = resp;
                if (_this.response.statusCode !== 200) {
                    return _this.errorHandler('Error loading file. HTTP status code ' + _this.response.statusCode);
                }
                _this.size = parseInt(_this.response.headers['content-length'], 10);
                _this.loaded = 0;
                _this.response.on('data', function (chunk) {
                    _this.loaded += chunk.length;
                    _this.emit('progress', _this.loaded / _this.size * 100);
                    _this.emit('data', new Buffer(new Uint8Array(chunk)));
                });
                _this.response.on('end', function () {
                    _this.emit('end');
                });
                _this.response.on('error', _this.errorHandler.bind(_this));
            });
            this.request.on('error', this.errorHandler.bind(this));
        };
        HTTPSource.prototype.pause = function () {
            if (this.response) {
                this.response.pause();
            }
        };
        HTTPSource.prototype.reset = function () {
            this.pause();
            this.request.abort();
            this.request = null;
            this.response = null;
        };
        HTTPSource.prototype.errorHandler = function (error) {
            this.reset();
            this.emit('error', error);
        };
        return HTTPSource;
    }(EventHost));

    var __extends$2 = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var Queue = /** @class */ (function (_super) {
        __extends$2(Queue, _super);
        function Queue(asset) {
            var _this = _super.call(this) || this;
            _this.ended = false;
            _this.readMark = 64;
            _this.finished = false;
            _this.buffering = true;
            _this.buffers = [];
            _this.asset = asset;
            _this.asset.on('data', _this.write.bind(_this));
            _this.asset.on('end', function () {
                _this.ended = true;
            });
            _this.asset.decodePacket();
            return _this;
        }
        Queue.prototype.write = function (buffer) {
            if (buffer) {
                this.buffers.push(buffer);
            }
            if (this.buffering) {
                if (this.buffers.length >= this.readMark || this.ended) {
                    this.buffering = false;
                    this.emit('ready');
                }
                else {
                    this.asset.decodePacket();
                }
            }
        };
        Queue.prototype.read = function () {
            if (this.buffers.length === 0) {
                return null;
            }
            this.asset.decodePacket();
            return this.buffers.shift();
        };
        Queue.prototype.reset = function () {
            this.buffers.length = 0;
            this.buffering = true;
            this.asset.decodePacket();
        };
        return Queue;
    }(EventHost));

    var __extends$1 = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var Asset = /** @class */ (function (_super) {
        __extends$1(Asset, _super);
        function Asset(source) {
            var _this = _super.call(this) || this;
            _this.source = source;
            _this.decoder = null;
            _this.buffered = 0;
            _this.duration = null;
            _this.format = null;
            _this.metadata = null;
            _this.active = false;
            _this.demuxer = null;
            _this.source.once('data', _this.probe.bind(_this));
            _this.source.on('error', function (err) {
                _this.emit('error', err);
                _this.stop();
            });
            _this.source.on('progress', function (buffered) {
                _this.buffered = buffered;
                _this.emit('buffer', _this.buffered);
            });
            return _this;
        }
        Asset.fromURL = function (url, opts) {
            return new Asset(new HTTPSource(url, opts));
        };
        Asset.fromFile = function (file) {
            return new Asset(new FileSource(file));
        };
        Asset.fromBuffer = function (buffer) {
            return new Asset(new BufferSource(buffer));
        };
        Asset.prototype.start = function (decode) {
            if (this.active) {
                return;
            }
            this.shouldDecode = (decode === undefined) ? false : !(!decode);
            this.active = true;
            this.source.start();
            if (this.decoder && this.shouldDecode) {
                this._decode();
            }
        };
        Asset.prototype.stop = function () {
            if (!this.active) {
                return;
            }
            this.active = false;
            this.source.pause();
        };
        Asset.prototype.get = function (event, callback) {
            var _this = this;
            if (['format', 'duration', 'metadata'].indexOf(event) === -1) {
                return;
            }
            if (this[event]) {
                return callback(this[event]);
            }
            this.once(event, function (value) {
                _this.stop();
                callback(value);
            });
            this.start();
        };
        Asset.prototype.decodePacket = function () {
            this.decoder.decode();
        };
        Asset.prototype.decodeToBuffer = function (callback) {
            var _this = this;
            var length = 0;
            var chunks = [];
            var dataHandler = function (chunk) {
                length += chunk.length;
                chunks.push(chunk);
            };
            this.on('data', dataHandler);
            this.once('end', function () {
                var buf = new Float32Array(length);
                var offset = 0;
                chunks.forEach(function (chunk) {
                    buf.set(chunk, offset);
                    offset += chunk.length;
                });
                _this.off('data', dataHandler);
                callback(buf);
            });
            this.start();
        };
        Asset.prototype.probe = function (chunk) {
            var _this = this;
            if (!this.active) {
                return;
            }
            var demuxer = Demuxer.find(chunk);
            if (!demuxer) {
                return this.emit('error', 'A demuxer for this container was not found.');
            }
            this.demuxer = new demuxer(this.source, chunk);
            this.demuxer.on('format', this.findDecoder.bind(this));
            this.demuxer.on('duration', function (duration) {
                _this.duration = duration;
                _this.emit('duration', _this.duration);
            });
            this.demuxer.on('metadata', function (metadata) {
                _this.metadata = metadata;
                _this.emit('metadata', _this.metadata);
            });
            this.demuxer.on('error', function (err) {
                _this.emit('error', err);
                _this.stop();
            });
        };
        Asset.prototype.findDecoder = function (format) {
            var _this = this;
            this.format = format;
            if (!this.active) {
                return;
            }
            this.emit('format', this.format);
            var decoderType = Decoder.find(this.format.formatID);
            if (!decoderType) {
                return this.emit('error', 'A decoder for #{@format.formatID} was not found.');
            }
            this.decoder = new decoderType(this.demuxer, this.format);
            if (this.format.floatingPoint) {
                this.decoder.on('data', function (buffer) {
                    _this.emit('data', buffer);
                });
            }
            else {
                var div_1 = Math.pow(2, this.format.bitsPerChannel - 1);
                this.decoder.on('data', function (buffer) {
                    var buf = new Float32Array(buffer.length);
                    for (var i = 0; i < buffer.length; i++) {
                        buf[i] = buffer[i] / div_1;
                    }
                    _this.emit('data', buf);
                });
            }
            this.decoder.on('error', function (err) {
                _this.emit('error', err);
                _this.stop();
            });
            this.decoder.on('end', function () {
                _this.emit('end');
            });
            this.emit('decodeStart');
            if (this.shouldDecode) {
                this._decode();
            }
        };
        Asset.prototype.destroy = function () {
            this.stop();
            if (this.demuxer) {
                this.demuxer.off();
            }
            if (this.decoder) {
                this.decoder.off();
            }
            if (this.source) {
                this.source.off();
            }
            this.off();
        };
        Asset.prototype._decode = function () {
            while (this.active && this.decoder.decode()) {
            }
            if (this.active) {
                this.decoder.once('data', this._decode.bind(this));
            }
        };
        return Asset;
    }(EventHost));

    /*
    The Player class plays back audio data from various sources
    as decoded by the Asset class.  In addition, it handles
    common audio filters like panning and volume adjustment,
    and interfacing with AudioDevices to keep track of the
    playback time.
    */
    var __extends = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var Player = /** @class */ (function (_super) {
        __extends(Player, _super);
        function Player(asset) {
            var _this = _super.call(this) || this;
            _this.asset = asset;
            _this.playing = false;
            _this.volume = 100;
            _this.pan = 0; // -50 for left, 50 for right, 0 for center
            _this.buffered = 0;
            _this.currentTime = 0;
            _this.duration = 0;
            _this.metadata = {};
            _this.startedPreloading = false;
            _this.device = null;
            _this.filters = [
                new VolumeFilter(_this, 'volume'),
                new BalanceFilter(_this, 'pan')
            ];
            _this.asset.on('buffer', function (buffered) {
                _this.buffered = buffered;
                _this.emit('buffer', _this.buffered);
            });
            _this.asset.on('decodeStart', function () {
                _this.queue = new Queue(_this.asset);
                _this.queue.once('ready', _this.startPlaying.bind(_this));
            });
            _this.asset.on('format', function (format) {
                _this.format = format;
                _this.emit('format', _this.format);
            });
            _this.asset.on('metadata', function (metadata) {
                _this.metadata = metadata;
                _this.emit('metadata', _this.metadata);
            });
            _this.asset.on('duration', function (duration) {
                _this.duration = duration;
                _this.emit('duration', _this.duration);
            });
            _this.asset.on('error', function (error) {
                _this.emit('error', error);
            });
            return _this;
        }
        Player.fromURL = function (url, opts) {
            return new Player(Asset.fromURL(url, opts));
        };
        Player.fromFile = function (file) {
            return new Player(Asset.fromFile(file));
        };
        Player.fromBuffer = function (buffer) {
            return new Player(Asset.fromBuffer(buffer));
        };
        Player.prototype.preload = function () {
            if (!this.asset) {
                return;
            }
            this.startedPreloading = true;
            this.asset.start(false);
        };
        Player.prototype.play = function () {
            if (this.playing) {
                return;
            }
            if (!this.startedPreloading) {
                this.preload();
            }
            this.playing = true;
            if (this.device) {
                this.device.start();
            }
        };
        Player.prototype.pause = function () {
            if (!this.playing) {
                return;
            }
            this.playing = false;
            if (this.device) {
                this.device.stop();
            }
        };
        Player.prototype.togglePlayback = function () {
            if (this.playing) {
                this.pause();
            }
            else {
                this.play();
            }
        };
        Player.prototype.stop = function () {
            this.pause();
            this.asset.stop();
            if (this.device) {
                this.device.destroy();
            }
        };
        Player.prototype.seek = function (timestamp) {
            var _this = this;
            if (this.device) {
                this.device.stop();
            }
            this.queue.once('ready', function () {
                if (!_this.device) {
                    return;
                }
                _this.device.seek(_this.currentTime);
                if (_this.playing) {
                    _this.device.start();
                }
            });
            // convert timestamp to sample number
            timestamp = (timestamp / 1000) * this.format.sampleRate;
            // the actual timestamp we seeked to may differ
            // from the requested timestamp due to optimizations
            timestamp = this.asset.decoder.seek(timestamp);
            // convert back from samples to milliseconds
            this.currentTime = timestamp / this.format.sampleRate * 1000 | 0;
            this.queue.reset();
            return this.currentTime;
        };
        Player.prototype.startPlaying = function () {
            var _this = this;
            var frame = this.queue.read();
            var frameOffset = 0;
            this.device = new AudioDevice(this.format.sampleRate, this.format.channelsPerFrame);
            this.device.on('timeUpdate', function (currentTime) {
                _this.currentTime = currentTime;
                _this.emit('progress', _this.currentTime);
            });
            this.refill = function (buffer) {
                if (!_this.playing) {
                    return;
                }
                // try reading another frame if one isn't already available
                // happens when we play to the end and then seek back
                if (!frame) {
                    frame = _this.queue.read();
                    frameOffset = 0;
                }
                var bufferOffset = 0;
                while (frame && bufferOffset < buffer.length) {
                    var max = Math.min(frame.length - frameOffset, buffer.length - bufferOffset);
                    for (var i = 0; i < max; i++) {
                        buffer[bufferOffset++] = frame[frameOffset++];
                    }
                    if (frameOffset === frame.length) {
                        frame = _this.queue.read();
                        frameOffset = 0;
                    }
                }
                // run any applied filters
                _this.filters.forEach(function (filter) {
                    filter.process(buffer);
                });
                // if we've run out of data, pause the player
                if (!frame) {
                    // if this was the end of the track, make
                    // sure the currentTime reflects that
                    if (_this.queue.ended) {
                        _this.currentTime = _this.duration;
                        _this.emit('progress', _this.currentTime);
                        _this.emit('end');
                        _this.stop();
                    }
                    else {
                        // if we ran out of data in the middle of
                        // the track, stop the timer but don't change
                        // the playback state
                        _this.device.stop();
                    }
                }
            };
            this.device.on('refill', this.refill);
            if (this.playing) {
                this.device.start();
            }
            this.emit('ready');
        };
        Player.prototype.destroy = function () {
            this.stop();
            if (this.device) {
                this.device.off();
            }
            if (this.asset) {
                this.asset.destroy();
            }
            this.off();
        };
        return Player;
    }(EventHost));

    exports.AIFFDemuxer = AIFFDemuxer;
    exports.AUDemuxer = AUDemuxer;
    exports.Asset = Asset;
    exports.AudioDevice = AudioDevice;
    exports.AudioDeviceBackend = AudioDeviceBackend;
    exports.BalanceFilter = BalanceFilter;
    exports.Base = Base;
    exports.Bitstream = Bitstream;
    exports.Buffer = Buffer;
    exports.BufferList = BufferList;
    exports.BufferSource = BufferSource;
    exports.Decoder = Decoder;
    exports.Demuxer = Demuxer;
    exports.EventHost = EventHost;
    exports.FileSource = FileSource;
    exports.Filter = Filter;
    exports.HTTPSource = HTTPSource;
    exports.LPCMDecoder = LPCMDecoder;
    exports.Player = Player;
    exports.Queue = Queue;
    exports.SeekPoint = SeekPoint;
    exports.Stream = Stream;
    exports.UnderflowError = UnderflowError;
    exports.VolumeFilter = VolumeFilter;
    exports.WAVEDemuxer = WAVEDemuxer;
    exports.WebAudioDevice = WebAudioDevice;
    exports.XLAWDecoder = XLAWDecoder;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({}, fs, http);
