import { Buffer } from './core';
export declare abstract class Filter {
    private context;
    private key;
    readonly value: any;
    constructor(context: any, key: any);
    abstract process(buffer: Buffer): any;
}
