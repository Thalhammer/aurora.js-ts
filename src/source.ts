import { IEventEmitter } from "./core";

export interface ISource extends IEventEmitter {
    start();
    pause();
}