import { IEventHost } from './core';

export interface ISource extends IEventHost {
	start();
	pause();
}
