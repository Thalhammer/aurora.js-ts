export class UnderflowError extends Error {
    constructor() {
        super();
        this.name = "UnderflowError";
        this.stack = new Error().stack;
    }
};