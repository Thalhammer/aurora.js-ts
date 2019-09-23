import * as AV from '../../src/';
import { CRC32 } from '../crc32';
import { config } from '../config';

describe('sources/file', () => {
    let getSource = (fn) => {
        // if we're in Node, we can read any file we like, otherwise simulate by reading 
        // a blob from an XHR and loading it using a FileSource
        if (global.Buffer)
            fn(new AV.FileSource(__dirname + "/../data/m4a/base.m4a"));
        else {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', config.HTTP_BASE + "/data/m4a/base.m4a");
            xhr.responseType = 'blob'
            xhr.send()
            xhr.onload = () => {
                fn(new AV.FileSource(xhr.response));
            };
        }
    };

    it('data', (done) => {
        getSource((source) =>{
            let crc = new CRC32();
            source.on('data', (chunk) => {
                crc.update(chunk);
            });

            source.on('end', ()=>{
                expect(crc.toHex()).toBe("84d9f967");
                done();
            });

            source.on("error", (err) => {
                console.log(err);
                expect(true).toBeFalsy();
            });

            source.start()
        });
    });

    it('progress', (done) => {
        getSource((source) =>{
            let lastProgress = 0;
            source.on('progress', (progress) => {
                expect(progress).toBeGreaterThan(lastProgress);
                expect(progress).toBeLessThanOrEqual(100);
                lastProgress = progress;
            });

            source.on ('end', ()=>{
                expect(lastProgress).toBe(100);
                done();
            });

            source.on("error", (err) => {
                console.log(err);
                expect(true).toBeFalsy();
            });

            source.start()
        });
    });
});