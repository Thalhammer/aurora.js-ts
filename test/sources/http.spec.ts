/**
 * @jest-environment jsdom
 */
import * as AV from '../../src/';
import { CRC32 } from '../crc32';
import { config } from '../config';

describe('sources/http', () => {
    it('data', (done) => {
        let crc = new CRC32();
        let source = new AV.HTTPSource(config.HTTP_BASE + "/data/m4a/base.m4a");

        source.on('data', (chunk) => {
            crc.update(chunk);
        });

        source.on('end', ()=>{
            expect(crc.toHex()).toBe("84d9f967");
            done();
        });

        source.on("error", (err) => {
            fail(err);
        });

        source.start();
    });

    it('progress', (done) => {
        let source = new AV.HTTPSource(config.HTTP_BASE + "/data/m4a/base.m4a");

        let lastProgress = 0;

        source.on("progress", (progress) => {
            expect(progress).toBeGreaterThan(lastProgress);
            expect(progress).toBeLessThanOrEqual(100);
            lastProgress = progress;
        });

        source.on('end', ()=>{
            expect(lastProgress).toBe(100);
            done();
        });


        source.on("error", (err) => {
            fail(err);
        });

        source.start();
    });

    it('invalid url error', (done) => {
        let source = new AV.HTTPSource("http://dlfigu");

        source.on("error", (err) => {
            expect(err).toBeDefined();
            done();
        });

        source.start();
    });

    it('404', (done) => {
        let source = new AV.HTTPSource(config.HTTP_BASE + "/nothing.m4a");

        source.on("error", (err) => {
            expect(err).toBeDefined();
            done();
        });

        source.start();
    });
});
