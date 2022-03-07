export class UnderflowError extends Error {
	constructor(m?: string) {
		super(m || 'UnderflowError');
		Object.setPrototypeOf(this, UnderflowError.prototype);
		this.name = 'UnderflowError';
	}
};
