import { Globals } from '@shared/providers/globals/globals';
import { Injectable } from '@angular/core';

@Injectable()
export class Logger {

    public fileName: string;

    constructor(private globals: Globals) { }

    log(...msg: any[]) {
        if (this.globals.isDebugMode) {
            msg.forEach(element => {
                console.log(`${this.fileName}:`, element);
            });

        }
    }
    error(...msg: any[]) {
        msg.forEach(element => {
            console.error(`${this.fileName}:`, element);
        });

    }
    warn(...msg: any[]) {
        msg.forEach(element => {
            console.warn(`${this.fileName}:`, element);
        });

    }
}