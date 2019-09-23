export class SeekPoint {
    offset: number;
    timestamp: number;

    constructor(offset?: number, timestamp?: number) {
        this.offset = offset || 0;
        this.timestamp = timestamp || 0;
    }
}