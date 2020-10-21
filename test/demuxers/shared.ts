import * as AV from '../../src';
import { CRC32 } from '../crc32';
import * as testcfg from '../config';
import * as fs from 'fs';

function multiDone(count, done) {
    return () => {
        if(--count == 0) done();
    };
}

export function demuxerTest(name, config) {
  it(name, (done: any) => {
    let source: any;
    if(global.Buffer) source = new AV.FileSource(__dirname + "/../data/" + config.file);
    else source = new AV.HTTPSource(testcfg.config.HTTP_BASE + "/data/" + config.file);

    source.once("data", (chunk) => {
        let demuxerType = AV.Demuxer.find(chunk);
        let demuxer = new demuxerType(source, chunk);

        let expected = (config.format ? 1:0) + (config.duration?1:0) + (config.metadata?1:0) + (config.chapters?1:0) + (config.cookie?1:0) + (config.data?1:0) + (config.dataLen?1:0);
        done = multiDone(expected, done);

        if(config.format) {
            demuxer.once("format", (format) => {
                expect(format).toEqual(config.format);
                done();
            });
        }
        if(config.duration) {
            demuxer.once("duration", (duration) => {
                expect(duration).toBe(config.duration);
                done();
            });
        }
        if(config.metadata) {
            demuxer.once("metadata", (metadata) => {
                if(metadata.coverArt) {
                    let crc = new CRC32();
                    crc.update(metadata.coverArt);
                    metadata.coverArt = crc.toHex();
                }
                expect(metadata).toEqual(config.metadata);
                done();
            });
        }
        if(config.chapters) {
            demuxer.once("chapters", (chapters) => {
                expect(chapters).toEqual(config.chapters);
                done();
            });
        }
        let crcData = new CRC32();
        let dataLen = 0;
        if(config.dataLen) {
            demuxer.on("data", (buffer) => {
                dataLen += buffer.length;
            });
        }
        if(config.data) {
            demuxer.on("data", (buffer) => {
                crcData.update(buffer);
            });
        }
        demuxer.on("end", () => {
            if(config.dataLen) {
                expect(dataLen).toBe(config.dataLen);
                done();
            }
            if(config.data) {
                expect(crcData.toHex()).toBe(config.data);
                done();
            }
            done();
        });
        demuxer.on("error", (err)=>{
            expect(err).not.toBeDefined();
            expect(true).toBeFalsy();
        });
    });
    source.start();
  });
}