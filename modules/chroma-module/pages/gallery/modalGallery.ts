import * as $ from 'jquery';
import { AlertController, LoadingController } from 'ionic-angular';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { Component, OnInit } from '@angular/core';
import { File, FileEntry } from '@ionic-native/file';
import { GalleryPage } from './gallery';
import { Globals } from '@shared/providers/globals/globals';
import { Logger } from '@shared/providers/logging/logger.service';
import { NavController, NavParams, Platform, Events, MenuController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { OrientationEventProvider } from '@shared/providers/orientation-event/orientation-event';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

@Component({
  selector: 'modal-gallery',
  templateUrl: 'modalGallery.html',
})
export class ModalGalleryPage implements OnInit {

    public album: any = [];
    public posicion = 0;
    public animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
    public isShow = true;
    public loader: any;
    public pictureRotate = 0;

    constructor(public navCtrl: NavController, 
        public navParams: NavParams, 
        private androidFullScreen: AndroidFullScreen, 
        private socialSharing: SocialSharing,
        public platform: Platform,
        public globals: Globals,
        private androidPermissions: AndroidPermissions,
        private file: File,
        private loadingCtrl: LoadingController,
        private log: Logger,
        private orientation: OrientationEventProvider,
        private event: Events,
        private screenOrientation: ScreenOrientation,
        private menu: MenuController
        ) {
        this.log.fileName = "modalGallery.ts";
    }

    ngOnInit() {
        this.menu.swipeEnable(false);
    this.loader =  this.loadingCtrl.create({
        content: "Cargando galería"
      });

      this.screenOrientation.unlock();

      this.orientation.getOrientation();

      this.event.subscribe("deviceRotated", (angle) => {
        console.log(angle);
        this.pictureRotate = angle;
    });


      this.loader.present();

      this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
        (data) =>
        {
            // refactorizar nombres y rutas y cambiar para usar FileHelper
          let gallery = [];
              this.file.listDir(this.file.externalRootDirectory, 'Pictures/TecnoBoda').then(files => {
                files.forEach((file, index) => {
                  if (file.name.indexOf('tecnoboda') >= 0) {
                    gallery.push({src: file.nativeURL, shareURL : file.nativeURL });
                  }
                });
                this.album = gallery;

                let albumPhotos = [];

                for (let i = 0; i < this.album.length; ++i) {
                    albumPhotos.push({
                        src: this.album[i].src,
                        shareURL: this.album[i].shareURL,
                        id: i
                    });
                }

                this.album = albumPhotos.reverse();

                if (this.navParams.get('posicion')) {
                    this.posicion = this.navParams.get('posicion');
                    this.log.log(this.posicion);
                } else {
                    setTimeout(()=> {
                        this.slideOcultar();
                    },6000);
                }

                this.loader.dismiss();

              }).catch(error => {
                this.log.log(error);
              });
        });

        this.androidFullScreen.isImmersiveModeSupported().then(() => {
            this.androidFullScreen.immersiveMode();
        }).catch((error: any) => {
            this.log.log(error);
        });

        this.platform.registerBackButtonAction(() => {
            this.androidFullScreen.showSystemUI();
            this.navCtrl.setRoot(GalleryPage, {album: this.album}, {animate: true, direction: "forward"});
        });
    }

    share(url) {
        let mensajeShare = 'Boda '+this.globals.remoteJson.titulo+' el '+this.globals.remoteJson.fecha_texto;

        let options = {
            message : mensajeShare,
            files : [url]
        }

        this.socialSharing.shareWithOptions(options).then(()=> {

        }).catch(error => {
            this.log.error(error);
        });
    }

    back() {
        this.navCtrl.setRoot(GalleryPage, {album: this.album}, {animate: true, direction: "forward"});
    }

    tap() {
        if(!this.isShow)
        {
            this.slideMostrar();
            setTimeout(()=> {
                if(this.isShow)
                    this.slideOcultar();
            },6000);            
        }else
        {
            this.slideOcultar();
        }
    }

    slideOcultar() {
        $('.headerGallery').removeClass('animated slideOutUp slideInDown');
        $('.btnShare').removeClass('animated slideOutDown slideInUp');
        $('.headerGallery').addClass('animated slideOutUp');
        $('.btnShare').addClass('animated slideOutDown');
        this.isShow = false;
    }

    slideMostrar() {
        $('.headerGallery').removeClass('animated slideOutUp slideInDown');
        $('.btnShare').removeClass('animated slideOutDown slideInUp');
        $('.headerGallery').addClass('animated slideInDown');
        $('.btnShare').addClass('animated slideInUp');
       this.isShow=true;   
    }
 
}