/// <reference types="node" />
import * as fs from 'fs';
import * as AV from '../core';
export declare class FileSource extends AV.EventHost {
    private filename;
    private stream;
    private loaded;
    private size;
    constructor(filename: string);
    start(): void | fs.ReadStream;
    pause(): void;
    private getSize;
}
