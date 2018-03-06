import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Globals } from '@shared/providers/globals/globals';

declare var ARPlugin: any;


@Injectable()
export class CraftArProvider {

  constructor(private globals: Globals) {
    console.log('Hello CraftArProvider Provider');
  }

  showARView(view: String)
  { 
      ARPlugin.ARActivity(view,this.globals.localMessageJson.configUrl);
  }

}
