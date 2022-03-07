import { Buffer } from './core';
export abstract class Filter {
	constructor(private context, private key) {
	}

	get value() {
		return this.context[this.key];
	}

	abstract process(buffer: Buffer);
}
