import { Directive, Input, ElementRef, Renderer, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { DomController } from 'ionic-angular';
import { Gesture } from 'ionic-angular';
declare var Hammer;
 
@Directive({
  selector: '[dblTap]'
})
export class DoubleTap implements OnInit, OnDestroy{
 
    el: HTMLElement;
    pressGesture: Gesture;
    @Output() dblTap: EventEmitter<any> = new EventEmitter();

    constructor(el: ElementRef) {
        this.el = el.nativeElement;
    }

    ngOnInit() {
        this.pressGesture = new Gesture(this.el, {
            recognizers: [
                [Hammer.Tap, {taps: 2}]
            ]
        });

        this.pressGesture.listen();
        this.pressGesture.on('tap', e => {
            this.dblTap.emit(e);
        })
    }

    ngOnDestroy() {
        this.pressGesture.destroy();
    }   
 
}