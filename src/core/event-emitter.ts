import {Base} from './base'


export interface IEventEmitter {
    on(event: string, fn);
    off(event?: string, fn?);
    once(event: string, fn);
    emit(event, ...args: any[]);
};

export class EventEmitter extends Base implements IEventEmitter {
    private events: {[index: string] : any[]};
    on(event: string, fn) {
        if(!this.events) this.events = {};
        if(!this.events[event]) this.events[event] = [];
        this.events[event].push(fn);
    }

    off(event?: string, fn?) {
        if(!this.events) return;
        if(!this.events[event]) return;
        if(!fn) {
            if(!event) this.events = {};
            else this.events[event] = [];
            return;
        }
        let idx = this.events[event].indexOf(fn);
        if(idx >= 0) this.events[event].splice(idx, 1);
    }

    once(event: string, fn) {
        let cb = (...args: any[])=>{
            this.off(event, cb);
            fn.apply(this, args);
        };
        this.on(event, cb);
    }

    emit(event, ...args: any[]) {
        console.log(this.constructor.name, event, args);
        if(!this.events || !this.events[event]) return;
        this.events[event].forEach(fn => {
            fn.apply(this, args);
        });
    }
};