import * as AV from '../../src';
import { CRC32 } from '../crc32';
import * as testcfg from '../config';
import * as fs from 'fs';
import { Decoder } from '../../src';

export function decoderTest(name, config) {
  it(name, (done) => {
    let source: any;
    if (global.Buffer) source = new AV.FileSource(__dirname + "/../data/" + config.file);
    else source = new AV.HTTPSource(testcfg.config.HTTP_BASE + "/data/" + config.file);

    source.once("data", (chunk) => {
      let demuxerType = AV.Demuxer.find(chunk);
      expect(demuxerType).toBeTruthy();
      let demuxer = new demuxerType(source, chunk);
      //let stream = fs.createWriteStream("temp.pcm");
      //let stream2 = fs.createWriteStream("temp2.pcm");

      /*demuxer.on("data", (chunk)=>{
        stream.write(new Uint8Array(chunk.data));
      });
      demuxer.on("end", ()=>{
        stream.end();
      });*/

      demuxer.once("format", (format) => {
        let decoderType = AV.Decoder.find(format.formatID);
        expect(decoderType).toBeTruthy();
        let decoder = new decoderType(demuxer, format);
        let crc = new CRC32();

        decoder.on("data", (chunk) => {
          //stream2.write(new Uint8Array(chunk.buffer));
          if(config.type) {
            expect(chunk).toBeInstanceOf(config.type);
          }
          crc.update(new AV.Buffer(new Uint8Array(chunk.buffer)));
        });
        decoder.on("end", () => {
          //stream2.end();
          expect(crc.toHex()).toBe(config.data);
          done();
        });
        decoder.on("error", (err) => {
          expect(err).toBeUndefined();
          expect(false).toBeTruthy();
        });
        let fn = ()=> {
          while(decoder.decode());
          decoder.once("data", fn);
        };
        fn();
      });
      demuxer.on("error", (err) => {
        expect(err).toBeUndefined();
        expect(false).toBeTruthy();
      });
    });
    source.on("error", (err) => {
      expect(err).toBeUndefined();
      expect(false).toBeTruthy();
    });
    source.start();
  });
}

export function decoderTestSkip(name, config) {
}