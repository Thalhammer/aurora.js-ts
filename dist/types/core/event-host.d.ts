import { Base } from './base';
export interface IEventHost {
    on(event: string, fn: any): any;
    off(event?: string, fn?: any): any;
    once(event: string, fn: any): any;
    emit(event: any, ...args: any[]): any;
}
export declare class EventHost extends Base implements IEventHost {
    private events;
    on(event: string, fn: any): void;
    off(event?: string, fn?: any): void;
    once(event: string, fn: any): void;
    emit(event: any, ...args: any[]): void;
}
