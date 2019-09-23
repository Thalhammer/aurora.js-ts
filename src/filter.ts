import { Buffer } from './core'
export abstract class Filter {
    get value() {
        return this.context[this.key];
    }
    constructor(private context, private key) {
    }

    abstract process(buffer: Buffer);
}