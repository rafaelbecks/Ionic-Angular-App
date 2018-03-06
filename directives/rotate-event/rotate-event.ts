import { Directive, Output, EventEmitter, HostListener } from '@angular/core';
 
@Directive({
    selector: '[rotateCustom]'
})
export class RotateCustomeDirective {
    @Output() angleChange = new EventEmitter<any>();
 

    @HostListener('rotatemove', ['$event']) protected onRotateMove(event) {
        event.preventDefault();
        this.angleChange.emit({ angle: event.angle });
    }
}