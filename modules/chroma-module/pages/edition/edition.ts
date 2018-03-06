import * as moment from 'moment';
import { AlertController, LoadingController, Platform } from 'ionic-angular';
import { ChromaKeyPage } from '../chroma-key/chroma-key';
import { Component, OnInit, Renderer } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Events, NavController, NavParams, MenuController } from 'ionic-angular';
import { FileHelper } from '@shared/providers/file-service/file-helper';
import { Globals } from '@shared/providers/globals/globals';
import { Logger } from '@shared/providers/logging/logger.service';
import { Screenshot } from '@ionic-native/screenshot';
import { WebCameraProvider } from '@chroma/providers/chroma-key/web-camera';
import { NgZone } from '@angular/core';
import { UploadDataService } from '@shared/providers/remote/uploadData.service';


declare var $: any;
declare var cordova: any;

@Component({
  selector: 'page-edition',
  templateUrl: 'edition.html',
  providers: [WebCameraProvider]
})
export class EditionPage implements OnInit {

  public brightness = 100;
  public contrast = 100;
  public saturation = 100;  

  public rangeBrightness = false;
  public rangeContrast = false;
  public rangeSaturation = false;

  public panelEffects = true;
  public captureValorEffect = null;
  public iconOrientation: any;
  public stickerOrientation = [];
  public srcPhoto;
  public isBackAlert = false;
  public $: any;
  public dismissAlert;
  public isFrameActive = false;

  public filters = [
    {className: "original", name: "Original" },
    {className: "walden", name: "Jupiter" },
    {className: "lofi", name: "Mars" },
    {className: "moon", name: "Orion" }, 
    {className: "clarendon", name: "Tycho" }, 
    {className: "nashville", name: "Cydonia" }, 
    {className: 'sepia', name: 'Númenor' }, 
    {className: 'sharp', name: 'Sharp' }, 
    {className: 'xpro2', name: 'Nebula' }, 
    {className: 'vignette', name: 'Gondor' }, 
    {className: 'mayfair', name: 'Vega' }, 
    {className: 'hudson', name: 'Lórien' }
  ];

  public horizontalScrollFilter: any;
  public filtro = 'original';
  public carouselFiltro = false;

  public modalSticker = false;
  public stickersPacks: any;
  public typePack: any;
  public attStickers: any = [];
  public rangeSizeSticker = false;
  public sizeSticker = 100;
  public selectStickerIndex: any;
  public selectStickerEvent: any;
  public savingImage : boolean = false;
  public angle: Number;
  public transformStyle: String;
  public startStickerSize;
  public onTrashZone = false;
  public startRotation: any;
  public currentPack: any;
  public currentControl: string = "Edición";
  private capturedImage : HTMLImageElement;
  public isSmallerThanScreen: boolean;
  public capturedImageData: any;
  public showTrash = false;
  public hideEye = false;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private _sanitizer: DomSanitizer,
    public renderer: Renderer,
    private screenshot: Screenshot,
    public alertCtrl: AlertController,
    private event: Events,
    public globals: Globals,
    private fileHelper: FileHelper,
    private loadingCtrl: LoadingController,
    private log: Logger,
    private webcam: WebCameraProvider,
    private platform: Platform,
    private zone: NgZone,
    private uploadService: UploadDataService,
    private menu: MenuController
    ) {
      this.log.fileName = "edition.ts";
      this.globals.showDebugInfo = false;
  }

  ngOnInit() {
      this.createAlert();
      this.menu.swipeEnable(false);
      localStorage.rotating = "false";
      this.hideEye = false;
      this.srcPhoto = localStorage.pictureData;    
      this.horizontalScrollFilter = this.filters.length * 76;
        
      this.stickersPacks = Object.keys(this.globals.localStickers);
      this.currentPack = this.stickersPacks[0];
      this.typePack = this.globals.localStickers[this.stickersPacks[0]];

      this.capturedImage = <HTMLImageElement> document.getElementById("capturedImage");

      this.capturedImage.onload = (evt) =>
      {
        let height = this.capturedImage.offsetHeight;

        this.capturedImageData = {
          height: height, 
          top: this.capturedImage.getBoundingClientRect().top,
          bottom: this.capturedImage.getBoundingClientRect().bottom
        }

        this.isSmallerThanScreen = (screen.height - height) > 20;
      }  

      if(this.globals.liveMode && this.globals.backgroundElement!=undefined)
      {
        document.getElementById("mainImageFigure").insertAdjacentElement("beforeend",this.globals.backgroundElement);
      }

    
        this.event.subscribe("deviceRotated", (icon) => {
        this.iconOrientation = icon;
      });
  
      this.event.subscribe("stickerTrash", (val) => {
        this.onTrashZone = val;
      });


      this.platform.registerBackButtonAction(() => {
        this.goBack();   
      });
    }


    createAlert()
    {
      this.dismissAlert = this.alertCtrl.create({
        title: 'Perderás cambios!',
        enableBackdropDismiss : false,
        subTitle: 'Estás editando una imagen, si regresas perderás cambios',
        buttons: [{
          text: 'Vale',
          handler: data => {
            this.navCtrl.setRoot(ChromaKeyPage, {}, {animate: true, direction: "forward"});
          }
        },
        {text: "Cancelar"}
      ],
        cssClass: 'alertCustomCss'
      });    
    }

  getFilters() {
    return this._sanitizer.bypassSecurityTrustStyle('brightness('+ this.brightness +'%) contrast('+ this.contrast +'%) saturate('+ this.saturation +'%)');
  }

  effects(valor) {
    this.deshacer();
    switch (valor) {
      case "brillo":
          this.captureValorEffect = this.brightness;
          this.rangeBrightness = true;
          this.panelEffects = false;
          this.currentControl = "Brillo";
        break;

      case "contraste":
          this.captureValorEffect = this.contrast;
          this.rangeContrast = true;
          this.panelEffects = false;
          this.currentControl = "Contraste";
        break;

      case "saturacion":
          this.captureValorEffect = this.saturation;
          this.rangeSaturation = true;
          this.panelEffects = false;
          this.currentControl = "Saturación";
        break;

      case "filtro":
          this.captureValorEffect = this.filtro;
          this.carouselFiltro = true;
          this.panelEffects = false;
          this.currentControl = "Filtros";
        break;

      case "sticker":
          this.modalSticker = true;
          this.panelEffects = false;
          this.currentControl = "Stickers";
        break;
    }
  }

  selectFilter(clase) {
    this.filtro = clase;
  }

  deshacer() {
    this.panelEffects = true;
    this.currentControl = "Edición";

    if (this.rangeBrightness == true) {
      this.rangeBrightness = false;
      this.brightness = this.captureValorEffect;
    }

    if (this.rangeContrast == true) {
      this.rangeContrast = false;
      this.contrast = this.captureValorEffect;
    }

    if (this.rangeSaturation == true) {
      this.rangeSaturation = false;
      this.saturation = this.captureValorEffect;
    }

    if (this.carouselFiltro == true) {
      this.carouselFiltro = false;
      this.filtro = this.captureValorEffect;
    }

    if (this.modalSticker == true) {
      this.modalSticker = false;
    }

    if (this.rangeSizeSticker == true) {
      this.rangeSizeSticker = false;
      this.sizeSticker = this.captureValorEffect;
      this.attStickers[this.selectStickerIndex].size = this.captureValorEffect;      
    }
  }

  saveEffect() {
    this.panelEffects = true;
    this.rangeBrightness = false;
    this.rangeContrast = false;
    this.rangeSaturation = false;
    this.carouselFiltro = false;
    this.rangeSizeSticker = false;
    this.modalSticker = false;
    this.currentControl = "Edición";
  }

  selectSticker(selectSticker) {
    let stickerObject = {
      src: selectSticker,
      size: 100,
      rotation: 0,
      touchedSize : false,
      x: 0,
      y: 0
    }

    this.startRotation = 0;
    this.attStickers.push(stickerObject);
    this.panelEffects = true;
    this.modalSticker = false;
    
    this.rangeSizeSticker = true;
    this.panelEffects = false;
    this.modalSticker = false;
    this.sizeSticker = stickerObject.size;
    this.selectStickerIndex = this.attStickers.length - 1;
    this.captureValorEffect = stickerObject.size;
    this.selectStickerEvent = document.getElementById("sticker"+this.selectStickerIndex);    
  }

  selectPackSticker(key) {
    this.currentPack = key;
    this.typePack = this.globals.localStickers[key];
  }

  addSizeSticker(event, index) {
    this.rangeSizeSticker = true;
    this.panelEffects = false;
    this.modalSticker = false;
    this.sizeSticker = event.target.width;
    this.selectStickerIndex = index;
    this.captureValorEffect = event.target.width;

    this.selectStickerEvent = event.target;
  }

  changeStickerSize(size) {
    this.attStickers[this.selectStickerIndex].size = size;
  }

  deleteSticker(index) {
    this.panelEffects = true;
    this.rangeSizeSticker = false;

    if (index) {
      this.attStickers.splice(index, 1);
    } else {
      this.attStickers.splice(this.selectStickerIndex, 1);
    }
    
  }

  deleteIfTrash(index)
  {
    if(this.onTrashZone)
      {
        this.deleteSticker(index);
      }
      this.showTrash = false;   
  }

  trashShow()
  {
    this.showTrash = true;
  }

  rotationStart(event : any, index)
  {
    this.startRotation = event.rotation;
  }


  onRotation(event: any, index): void {
    localStorage.rotating = "true";

    this.attStickers[index].rotation = event.rotation - this.startRotation;
  }

  rotateEnd()
  {
    setTimeout(() => localStorage.rotating = "false" ,500);    
  }

  increaseSize(event: any, index)
  {
        
        if(!this.attStickers[index].touchedSize)
        {
          this.startStickerSize = this.attStickers[index].size;
          this.attStickers[index].touchedSize = true;
        }
        this.attStickers[index].size = this.startStickerSize * event.scale;
  }

  onPanStart(event: any,index): void {
    event.preventDefault();
    this.attStickers[index].x = this.attStickers[index].x;
    this.attStickers[index].y = this.attStickers[index].y;
  }

  onPan(event: any,index): void {
    event.preventDefault();
    this.attStickers[index].x = this.attStickers[index].x + event.deltaX;
    this.attStickers[index].y = this.attStickers[index].y + event.deltaY;
  }


  pinchEnd(index)
  {
    this.attStickers[index].touchedSize = false;
  }

  save() {
    // refactorizar nombre de directorio de almacenamiento, formato de nombre y mensajes informativos

    let loader =  this.loadingCtrl.create({
      content: "Guardando imagen"
    });

    this.savingImage = true;
    this.hideEye = true;
    let fileName = "/TecnoBoda/tecnoboda_" + this.globals.remoteJson.iniciales + "_" + moment().format("YYYYMMDD__HHmmss");
      setTimeout(() => {
        if(!this.isSmallerThanScreen || this.isFrameActive)
        {
          if(this.globals.lastOrientation != 0)
          {
            this.screenshot.URI(100).then((res)=>{
              this.rotateAndSave(res.URI,loader);
            });
          }else
          {
            this.screenshot.save('jpg', 100, fileName).then(res => {
              // this.uploadService.getFileContentAsBase64(res.filePath, (data)=>{
              //   this.uploadPhoto(data);
              // });
              this.successSave();
            });              
          }
        }else
        {
          this.screenshot.URI(100).then((res)=>{
            this.zone.run(()=>{
              this.savingImage = false;
              loader.present().then(()=>{
                this.cropImage(res.URI).then((data)=>
                {
                    if(this.globals.lastOrientation != 0)
                    {
                      this.webcam.rotateBase64Image(data,this.globals.lastOrientation).then((data)=>{
                        this.saveCropped(data,loader);
                      });
                    }else
                    {
                      this.saveCropped(data,loader);
                    }
               })
              });;

            });
          });
        }
      }, 1000);
  }

  saveCropped(data,loader)
  {
    this.uploadPhoto(data);
    this.base64ToGallery(data,loader)
  }

  base64ToGallery(data,loader)
  {
    cordova.base64ToGallery(
      data,
      {
          prefix: 'TecnoBoda/tecnoboda_',
          mediaScanner: true
      },

      (path) => {
          loader.dismiss();
          this.successSave();
      },

      (err) => {
          console.error(err);
      }
    );
  }

  rotateAndSave(data,loader)
  {
    this.webcam.rotateBase64Image(data,this.globals.lastOrientation).then((data)=>{
      this.base64ToGallery(data,loader);
    })
  }

  uploadPhoto(data){

    this.uploadService.uploadBASE64(data,this.globals.remoteAlbumDestino.album).then((data)=>{
      console.log(data);
    });

  }

  cropImage(base64Data)
  {

    return new Promise((res,rej)=>{

      let canvas = document.createElement("canvas");
      let context = canvas.getContext('2d');      
      let imageObj = new Image;
  
      imageObj.onload = () => {

        let newTop = this.capturedImageData.top * window.devicePixelRatio;
        canvas.width = imageObj.width;
        canvas.height = imageObj.height - (newTop * 2);
        context.drawImage(imageObj,
           0,
           newTop,
           imageObj.width,
           imageObj.height - (newTop * 2),
           0,
           0, 
           imageObj.width, 
           imageObj.height - (newTop * 2));
           res(canvas.toDataURL());
          };

        imageObj.src = base64Data;  

    });

  }

  successSave()
  {
    this.savingImage = false;
    let alert = this.alertCtrl.create({
      title: 'Correcto!',
      enableBackdropDismiss : false,
      subTitle: 'Foto procesada y almacenada en galería',
      buttons: [{
        text: 'Ok',
        handler: data => {
          this.fileHelper.getTecnobodaPictures();
          this.navCtrl.setRoot(ChromaKeyPage, {}, {animate: true, direction: "forward"});
        }
      }],
      cssClass: 'alertCustomCss'
    });
    alert.present();
  }

  isEditing()
  {
    if ( (this.attStickers.length == 0) && (this.filtro == "original") && (this.brightness == undefined || this.brightness == 100) && (this.contrast == undefined || this.contrast == 100) && (this.saturation == undefined || this.saturation == 100))
    {
      return false;
    }else
    {
      return true;
    }
  }

  goBack()
  {
    if(this.isEditing())
    {
      console.log(this.isBackAlert);
      if(!this.isBackAlert)
      {
        this.isBackAlert = true;
        this.dismissAlert.present();  
      }else
      {
        this.isBackAlert = false;
        this.dismissAlert.dismiss();
        this.createAlert();
      }
    }else
    {
      this.navCtrl.setRoot(ChromaKeyPage, {}, {animate: true, direction: "forward"});
    }
  }

  toggleFrame()
  {
    this.isFrameActive = (this.isFrameActive) ? false : true;
  }

  toggleSavingImage()
  {
    this.savingImage = (this.savingImage) ? false : true;
  }

  imageToBase64(url)
  {
    let img = new Image();
    let canvas = document.createElement("canvas");
    let context = canvas.getContext('2d');      

    img.onload = (()=>{

      canvas.width = img.width;
      canvas.height = img.height;

    });

    img.src = url;
  
  }


}
