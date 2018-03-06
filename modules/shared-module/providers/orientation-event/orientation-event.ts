import { Events } from 'ionic-angular';
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

@Injectable()
export class OrientationEventProvider {

  constructor(public http: Http, private evt: Events) { }


  getOrientation(){
        window.addEventListener("deviceorientationabsolute", (event:any) => {
         
          let orientationTest: any = {alpha: 0, beta: 0, gamma:0, absolute: 0};
          let iconOrientation: any;

          orientationTest.alpha = event.alpha;
          orientationTest.beta = event.beta;
          orientationTest.gamma = event.gamma;
          orientationTest.absolute = event.absolute;

          if((event.gamma>=45 && event.gamma <= 90 ))
          {
            iconOrientation = 90;
            if(event.beta <= - 100 || event.beta >= 100)
            {
              iconOrientation = -90;
            }
          }
          if(event.gamma >=-45 && event.gamma <= 45)
          {
            iconOrientation = 0;
          }
          if(event.gamma <=-45 && event.gamma >=-90)
          {
            iconOrientation = -90;
            if(event.beta > 100 || event.beta <= -100) 
            {
              iconOrientation = 90;
            }
          }

          iconOrientation = iconOrientation;
          
          this.evt.publish("deviceRotated",iconOrientation);

        }, true);

  }

}
