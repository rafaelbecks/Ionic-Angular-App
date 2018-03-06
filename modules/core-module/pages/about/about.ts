import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { Globals } from '@shared/providers/globals/globals';
import { HomePage } from '@core/pages/home/home';


@IonicPage()
@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public globals: Globals,private platform: Platform) {
  }

  back()
  {
    this.navCtrl.setRoot(HomePage);
  }

  ionViewDidLoad() {
    this.platform.registerBackButtonAction(() => {
      this.back();
    });
    console.log('ionViewDidLoad AboutPage');
  }

}
