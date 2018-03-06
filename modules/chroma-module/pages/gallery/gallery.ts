import { ChromaKeyPage } from '../chroma-key/chroma-key';
import { Component, OnInit } from '@angular/core';
import { Globals } from '@shared/providers/globals/globals';
import { Logger } from '@shared/providers/logging/logger.service';
import { ModalGalleryPage } from './modalGallery';
import { NavController, NavParams, Platform, MenuController } from 'ionic-angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation';


@Component({
  selector: 'page-gallery',
  templateUrl: 'gallery.html',
})
export class GalleryPage implements OnInit {

    public album: any = [];

    constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform,
          public globals: Globals, public log:Logger, private screenOrientation: ScreenOrientation,private menu: MenuController) {
        this.log.fileName = "gallery.ts";
    }

    ngOnInit() {
        this.menu.swipeEnable(false);

        this.album = this.navParams.get('album');

        this.platform.registerBackButtonAction(() => {
            this.navCtrl.setRoot(ChromaKeyPage, {}, {animate: true, direction: "forward"});
        });
    }

    openGallery(id) {
        this.navCtrl.push(ModalGalleryPage, {posicion: id});
    }

    back() {
        this.navCtrl.setRoot(ChromaKeyPage, {}, {animate: true, direction: "forward"});
    }

    ionViewWillLeave() {
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    }
    
}