import { Buffer } from './core';
export declare abstract class Filter {
    private context;
    private key;
    constructor(context: any, key: any);
    get value(): any;
    abstract process(buffer: Buffer): any;
}
