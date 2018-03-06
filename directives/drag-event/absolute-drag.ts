import { Directive, Input, ElementRef, Renderer } from '@angular/core';
import { DomController, Events } from 'ionic-angular';
 
@Directive({
  selector: '[absolute-drag]'
})
export class AbsoluteDrag {
 
    @Input('startLeft') startLeft: any;
    @Input('startTop') startTop: any;
 
    constructor(public element: ElementRef, public renderer: Renderer, public domCtrl: DomController, private evt: Events) {
 
    }
 
    ngAfterViewInit() {
 
        this.renderer.setElementStyle(this.element.nativeElement, 'position', 'fixed');
        this.renderer.setElementStyle(this.element.nativeElement, 'left', this.startLeft + 'px');
        this.renderer.setElementStyle(this.element.nativeElement, 'top', this.startTop + 'px');
 
        let hammer = new window['Hammer'](this.element.nativeElement);
        hammer.get('pan').set({ direction: window['Hammer'].DIRECTION_ALL });
 
        hammer.on('pan', (ev) => {
          this.handlePan(ev);
        });
 
    }
 
    handlePan(ev){
 
        let newLeft = ev.center.x - (this.element.nativeElement.width / 2);
        let newTop = ev.center.y - (this.element.nativeElement.height / 2);
        let image = <HTMLImageElement> document.getElementById("capturedImage");
        let toolbarElement = <HTMLElement> document.getElementById("toolbarEdition");
        let trashElement = <HTMLElement> document.getElementById("headerDelete");

        let borderTop = image.getBoundingClientRect().top;
        let borderBottom = image.getBoundingClientRect().bottom - this.element.nativeElement.height;

        if(borderTop <= 1)
        {
            borderBottom = toolbarElement.getBoundingClientRect().top - this.element.nativeElement.height;
        }

        newTop = (newTop <= borderTop) ? borderTop : (newTop >= borderBottom) ? borderBottom : newTop;

        if(trashElement.classList.contains("headerDeleteSmaller"))
        {
            if((newTop>=160 && newTop<=260) && (newLeft <= -5))
            {
                this.evt.publish("stickerTrash",true);                
            }else
            {
                this.evt.publish("stickerTrash",false);                                
            }
        }else
        {
            if(newTop < 5 && (newLeft>=100 || newLeft<=110))
            {
                this.evt.publish("stickerTrash",true);
            }else
            {
                this.evt.publish("stickerTrash",false);
            }    
        }

        if(localStorage.rotating == "false")
        {
            this.domCtrl.write(() => {
                this.renderer.setElementStyle(this.element.nativeElement, 'left', newLeft + 'px');
                this.renderer.setElementStyle(this.element.nativeElement, 'top', newTop + 'px');
            });                
        }


 
    }
 
}