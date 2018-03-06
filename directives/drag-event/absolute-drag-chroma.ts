import { Directive, Input, ElementRef, Renderer } from '@angular/core';
import { DomController } from 'ionic-angular';
 
@Directive({
  selector: '[absolute-drag-chroma]'
})
export class AbsoluteDragChroma {
 
    @Input('startLeft') startLeft: any;
    @Input('startTop') startTop: any;
 
    constructor(public element: ElementRef, public renderer: Renderer, public domCtrl: DomController) {
 
    }
 
    ngAfterViewInit() {
        let chromaElement = document.getElementById("background");
        this.renderer.setElementStyle(chromaElement, 'position', 'absolute');
        this.renderer.setElementStyle(chromaElement, 'left', this.startLeft + 'px');
        this.renderer.setElementStyle(chromaElement, 'top', this.startTop + 'px');
 
        let hammer = new window['Hammer'](this.element.nativeElement);
        hammer.get('pan').set({ direction: window['Hammer'].DIRECTION_ALL });
 
        hammer.on('pan', (ev) => {
          this.handlePan(ev);
        });
 
    }
 
    handlePan(ev){
        let chromaElement = document.getElementById("background"); 
        let newLeft = ev.center.x - (chromaElement.scrollWidth / 2);
        let newTop = ev.center.y - (chromaElement.scrollHeight / 2);
        this.domCtrl.write(() => {
            this.renderer.setElementStyle(chromaElement, 'left', newLeft + 'px');
            this.renderer.setElementStyle(chromaElement, 'top', newTop + 'px');
        });
 
    }
 
}