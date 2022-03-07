import { Filter } from '../filter';

export class BalanceFilter extends Filter {
	process(buffer) {
		if (this.value === 0) {
			return;
		}
		if (buffer.length % 2 !== 0) {
			throw new Error('Odd buffer passed to balance filter');
		}
		const pan = Math.max(-50, Math.min(50, this.value));
		const panL = Math.min(1, (50 - pan) / 50);
		const panR = Math.min(1, (50 + pan) / 50);

		for (let i = 0; i < buffer.length; i += 2) {
			buffer[i] *= panL;
			buffer[i + 1] *= panR;
		}
	}
}
