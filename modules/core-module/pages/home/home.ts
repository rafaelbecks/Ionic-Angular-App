import { AndroidPermissions } from '@ionic-native/android-permissions';
import { Component, OnInit } from '@angular/core';
import { Globals } from '@shared/providers/globals/globals';
import { NavController, Platform, MenuController } from 'ionic-angular';
import { FileHelper } from '@shared/providers/file-service/file-helper';
import { CraftArProvider } from '@ar/providers/craft-ar/craft-ar';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: []
})
export class HomePage implements OnInit {


  public weddingUrl: any;
  // globals es usado en el template
  constructor(public navCtrl: NavController, private menu: MenuController, public platform: Platform, public globals: Globals,
   private androidPermissions: AndroidPermissions, private fileHelper: FileHelper, private ARITProvider: CraftArProvider) {
    this.globals.showDebugInfo = true;
  }


  ionViewDidEnter ()
  {
    this.menu.swipeEnable(true);
    this.menu.enable(true, "tbmenu"); 
  }

  ngOnInit() {
    this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA);
    this.weddingUrl = this.globals.remoteJson.urlBase;

    this.platform.registerBackButtonAction(() => {

      if(this.navCtrl.getActive().name === 'HomePage')
      {
        this.platform.exitApp();        
      }

    });

    this.fileHelper.createDirectory();

  }

  goAbout()
  {
    this.navCtrl.push("about");
  }

  goSplash()
  {
    this.navCtrl.push("splash");
  }

  initView(view)
  {
    this.ARITProvider.showARView(view);
  }
}
