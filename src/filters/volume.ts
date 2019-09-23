import { Filter } from '../filter'

export class VolumeFilter extends Filter {
    process(buffer) {
        if(this.value >= 100) return;
        let vol = Math.max(0, Math.min(100, this.value)) / 100;

        for(let i=0; i<buffer.length; i++) {
            buffer[i] *= vol;
        }
    }
}