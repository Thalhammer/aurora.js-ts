import { IEventHost } from './core';
export interface ISource extends IEventHost {
    start(): any;
    pause(): any;
}
