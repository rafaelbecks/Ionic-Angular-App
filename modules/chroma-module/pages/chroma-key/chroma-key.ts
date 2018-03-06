import { AlertController, LoadingController } from 'ionic-angular';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  Events,
  NavController,
  NavParams,
  Platform,
  MenuController
  } from 'ionic-angular';
import { FileHelper } from '@shared/providers/file-service/file-helper';
import { Globals } from '@shared/providers/globals/globals';
import { Loading } from 'ionic-angular/components/loading/loading';
import { Logger } from '@shared/providers/logging/logger.service';
import { OrientationEventProvider } from '@shared/providers/orientation-event/orientation-event';
import { SeriouslyProvider } from '../../providers/seriously/seriously';
import { WebCameraProvider } from '../../providers/chroma-key/web-camera';
import { NgZone } from '@angular/core';


declare var CameraPreview: any;

@Component({
  selector: 'page-chroma-key',
  templateUrl: 'chroma-key.html',
  providers : [WebCameraProvider]
})
export class ChromaKeyPage implements OnInit {
    private commonButton: any = [{text: "ok"}];

    public showFilters : boolean = false;
    public showZoomSlider : boolean = false;
    public optionsTabs: string = "colorFilters";
    public liveMode: boolean = false;
    public maxZoom: number = 2;
    public minZoom:number = 0; 
    public zoomValue:number = 1;
    public flashMode:number = 0;
    public flashModes: Array<string> = [];
    public zoomStep: number;
    public iconOrientation:number = 0; // usada para detección de elementos de la camara (botones, filtros toolbar)
    public lastImage: any;
    public currentBackground: string = "";
    
    public orientationTest: any = {alpha: 0, beta: 0, gamma:0, absolute: 0}; // para pruebas
    
    public imageSize: number = 250;
    public showChromaControls: boolean = false;
    public chromaTabs: string = "size";
    public takingPhoto : boolean = false;
    public imageRotate:number = 0; // usada para detección de rotación en chroma
    public currentEffect:string;
    public newSize: any = {};
    public showBackground : boolean = false;
//    public screenDensity: any;
    public cameraPreview: any = CameraPreview;
    public cameraSound: HTMLAudioElement = new Audio(this.globals.defaultCameraAudio);
    public loader: Loading =  this.loadingCtrl.create({
        content: this.globals.localMessageJson.chroma.camara.pleaseWait
      });

    public isFlashChanging: boolean = false;

    public cameraPreviewOpts: any = 
    {
      x: 0,
      y: 0,
      width: window.screen.width,
      height: window.screen.height,
      camera: 'back',
      tapPhoto: true,
      previewDrag: true,
      toBack: true,
      alpha: 1
    };

    public colorEffects: Array<string> = ["none"];

    public chromaBackgrounds: Array<string> = ["beach", "bridge", "england", "paradise", "paradise2","snow","spacestation","sunny"];

    public horizontalScrollFilter: number;

    public horizontalScrollChroma: number = this.chromaBackgrounds.length * 72;

    public iconsFlash: any = 
    {
      "on" : "ios-flash",
      "off" : "ios-flash-outline",
      "torch" : "ios-sunny-outline",
      "auto" : "ios-flash"
    };

    public isLoadingShow: boolean = false;


  constructor(public navCtrl: NavController,
   public navParams: NavParams,
   private platform: Platform,
   private androidFullScreen: AndroidFullScreen,
   public webCameraService: WebCameraProvider,
   public loadingCtrl: LoadingController,
   private event: Events,
   private _sanitizer: DomSanitizer,
   private orientationProvider: OrientationEventProvider,
   private alertController: AlertController,
   private seriously: SeriouslyProvider,
   public globals : Globals,
   private zone: NgZone,
   private fileHelper: FileHelper,
   private log: Logger,
   private menu: MenuController) {
    this.log.fileName = "chroma-key.ts";
  }

  ngOnInit(){
    this.fileHelper.getTecnobodaPictures();
    this.globals.showDebugInfo = false;
  }

  ionViewDidEnter()
  {

    this.menu.swipeEnable(false);
    this.zone.run(()=>{

      this.cameraPreview.getSupportedPictureSizes((sizes)=> {
        this.log.log(`Picture Sizes: ${sizes}`);
        sizes.forEach((size) => {
          this.log.log(`${size.width}w x ${size.height}h`);
        });
  
      });
  
      if(this.globals.liveMode)
      {
        this.initWebCam();
        this.liveMode = true;
        this.optionsTabs = "chroma";
      }else
      {
        this.initNativeCamera();      
      }
  
      this.fileHelper.getLastPhoto().then((data)=>{
        console.log(data);
        this.lastImage = data;
      })
  
  
        this.platform.registerBackButtonAction(() => {
  
          this.backButtonAction();
     
        });
  
    });
  }


  startCamera()
  {
      this.cameraPreview.startCamera(this.cameraPreviewOpts, (res) => {
        this.calculateSizeCamera();
      },
      (error) => {
        this.log.error(`Error en startCamera: ${error}`);
      });
  }

  // Inicio de cámara nativa (plugin cameraPreview)
  initNativeCamera()
  {
        this.cameraPreview.onBackButton(() => {
          this.backButtonAction();
        });

      this.startCamera();

      this.androidFullScreen.isImmersiveModeSupported().then(() => {
          this.androidFullScreen.immersiveMode();
      }).catch((error: any) => {
          this.log.error(`Error en isImmersiveModeSupported: ${error}`);
          this.drawAlertDialog("Error en isImmersiveModeSupported", error, this.commonButton);
      });

      this.orientationProvider.getOrientation();

      this.event.subscribe("deviceRotated", (icon) => {
        if(this.globals.activateZone)
        {
          this.zone.run(() =>
          {
            this.iconOrientation = icon;
            this.imageRotate = (this.imageRotate == 0 || this.imageRotate == 90 || this.imageRotate == -90) ?  icon : this.imageRotate;  
          });  
        }else
        {
          this.iconOrientation = icon;
          this.imageRotate = (this.imageRotate == 0 || this.imageRotate == 90 || this.imageRotate == -90) ?  icon : this.imageRotate;          
        }
      });
  }

  switchCamera()
  {
      this.cameraPreview.switchCamera(()=>{
        this.cameraPreviewOpts.camera = (this.cameraPreviewOpts.camera == "front") ? "back" : "front";        
        this.startCamera();
      });
  }

  calculateSizeCamera()
  {
    this.isLoadingShow = true;
    
    let loader: any =  this.loadingCtrl.create({
      content: this.globals.localMessageJson.chroma.camara.on
    });

    loader.present();

    this.cameraPreview.getSupportedPictureSizes((dimensions)=>{
      this.newSize = this.webCameraService.aspectRatioResizer(dimensions[0].height, dimensions[0].width, window.screen.width, window.screen.height); 
      this.cameraPreview.stopCamera(()=>{
        this.initCalculatedCamera();
        loader.dismiss();
      });
    });  
  }

  initCalculatedCamera()
  {
    this.cameraPreviewOpts.width = this.newSize.width;
    this.cameraPreviewOpts.height = this.newSize.height;
    this.cameraPreviewOpts.y = ((window.screen.height / 2) - (this.newSize.height / 2)) - 2;    
    this.cameraPreview.startCamera(this.cameraPreviewOpts, (res) => {
      this.toggleFilters(); this.toggleFilters();
      this.getConstrains();
      this.isLoadingShow = false;        
    });            
  }

  toggleFullScreenCamera()
  {
    if(this.cameraPreviewOpts.y != 0)
    {
      this.cameraPreview.stopCamera(()=>{
        this.cameraPreviewOpts.width = window.screen.width;
        this.cameraPreviewOpts.height = window.screen.height;
        this.cameraPreviewOpts.y = 0;
        this.cameraPreview.startCamera(this.cameraPreviewOpts, (res) => {
          this.toggleFilters(); this.toggleFilters();
          this.getConstrains();
        });              
      });
    }else
    {
      this.cameraPreview.stopCamera(()=>{
        this.initCalculatedCamera();
      });
    }

  }

  backButtonAction()
  {

    if(this.navCtrl.getActive().name === 'ChromaKeyPage')
    {
      if(this.showFilters)
      {
        this.toggleFilters();
      }else if(this.showZoomSlider)
      {
        this.toggleZoom();
      }else
      {
          if(this.liveMode)
          {
            this.stopWebCam();
          }else
          {
            this.cameraPreview.stopCamera();
          }

          let loaderCamera =  this.loadingCtrl.create({
            content: this.globals.localMessageJson.chroma.camara.off
          });

          loaderCamera.present();

          setTimeout(()=>{
            loaderCamera.dismiss();
            this.androidFullScreen.showSystemUI();
            this.navCtrl.setRoot("menu");  
          },1000)

      }
    }
  }


  getConstrains()
  {

      this.cameraPreview.getMaxZoom((data) => {
        this.maxZoom = data;
        this.zoomStep = data/6;
      });


      this.cameraPreview.getZoom((data) => {
        this.minZoom = data;
      });

        this.cameraPreview.getSupportedColorEffects((result) => {       
          this.log.log(`getSupportedColorEffects: ${result}`);
          this.colorEffects = result;
          this.horizontalScrollFilter = this.colorEffects.length * 72;

          if(result.length == 0 || result == "none")
          {
            this.colorEffects = [];
            this.optionsTabs = "chroma";
          }

        }, (error)=> 
          {
            this.log.error(`Error en getSupportedColorEffects: ${error}`);
            this.optionsTabs = "chroma";
          });

        this.cameraPreview.getSupportedFlashModes((data) => {
            this.flashModes = data
            this.cameraPreview.setFlashMode(this.flashModes[this.flashMode]);
        });

  }

  changeFlash()
  {
    this.flashMode = (this.flashMode == (this.flashModes.length)-1) ? 0 : this.flashMode + 1;
    this.isFlashChanging = true;
    this.log.log(`isFlashChanging: ${this.isFlashChanging}`);
    this.cameraPreview.setFlashMode(this.flashModes[this.flashMode],()=> {
      this.isFlashChanging = false;
      this.log.log(`setFlashMode: ${this.isFlashChanging}`);
    });
  }

  takePhoto()
  {
    this.globals.liveMode = this.liveMode;
    if(!this.liveMode)
      {
        let pictureOpts = {
          quality: 85
        }
        this.globals.backgroundElement = undefined;
        this.cameraPreview.takePicture(pictureOpts,(imageData) => {
            this.lastImage = 'data:image/jpeg;base64,' + imageData;
            localStorage.pictureData = this.lastImage;
            this.globals.lastOrientation = this.iconOrientation;
            this.cameraPreview.stopCamera(()=>
            {
              this.navCtrl.setRoot("edition");

            });
        });
      }else
      {
        this.cameraSound.play();
        this.loader.present();
        this.seriously.getCanvasURI().then((URI)=>
        {
          this.globals.lastOrientation = this.iconOrientation;
          this.globals.backgroundElement = <HTMLImageElement> document.getElementById("background");
          this.takingPhoto = false;
          this.lastImage = URI;
          localStorage.pictureData = this.lastImage;
          this.webCameraService.stopCamera();
          this.seriously.destroyChroma();
          this.loader.dismiss();
          this.showBackground = false;
          this.navCtrl.setRoot("edition");
        });

      }
  }
  
  setZoom()
  {
      if(!this.liveMode)
        this.cameraPreview.setZoom(this.zoomValue);
      else
        this.webCameraService.changeZoom(this.zoomValue, {min: this.minZoom, max : this.maxZoom});
  }

  setColorEffect(effect)
  {
      this.currentEffect = effect;
      this.cameraPreview.setColorEffect(effect);
  }

  toggleFilters()
  {

      if(this.showChromaControls)
      {
        this.showChromaControls = false;
      }

      this.showFilters = !(this.showFilters) ? true : false;
  }

  toggleZoom()
  {
      this.showZoomSlider = !(this.showZoomSlider) ? true : false;
  }

  toggleCamera()
  {
    if(this.liveMode)
    {
      this.initWebCam();
    }else
    {
      this.stopWebCam();
    }
  }

  initWebCam()
  {
      this.loader.present();
  
      if(this.globals.liveMode == false)
        this.cameraPreview.stopCamera();      
  
        this.webCameraService.initCamera().then((ok) => {
          this.loader.dismiss();
          this.seriously.initChromaKey();
          console.log(this.currentBackground);
          this.showBackground = true;
      }).catch((error) => {
        this.loader.dismiss();
        this.log.error(`Error en initCamera:`, error);
      })
      .catch((error2)=>{
        this.loader.dismiss();
        this.log.error(error2);
      });
  }

  stopWebCam()
  {
    this.globals.liveMode = false;
    this.webCameraService.stopCamera();
    this.seriously.destroyChroma();
    setTimeout(() => { this.initNativeCamera();} ,500);    
  }

  selectBackground(background)
  {
    if(this.liveMode)
    {
      this.currentBackground = background; 
    }
  }

  switchWebCam()
  {
    this.loader.present();
    localStorage.camera = (localStorage.camera == 0) ? 1 : 0;
    this.webCameraService.stopCamera();
    this.webCameraService.initCamera().then((ok) => {
          this.seriously.initChromaKey();
      })
      .catch((error)=>{
        this.log.error(`Error en switchWebCam: `, error);
      });
  }

  activateChromaControls()
  {
    if(this.showFilters)
    {
      this.showFilters = false;
    }

    this.showChromaControls = (this.showChromaControls) ? false : true;
  }

  goToGallery()
  {
    if (Globals.isEmpty(this.globals.gallery) || this.lastImage == undefined)
    {
      this.drawAlertDialog(
        this.globals.localMessageJson.chroma.gallery.noPhotos.title, this.globals.localMessageJson.chroma.gallery.noPhotos.subTitle,
        [{
          text: this.globals.localMessageJson.chroma.gallery.noPhotos.button
        }], 
        true
      )
    } else {
      this.navCtrl.setRoot("photoSlide");
    }
    
  }

  getLastImage()
  {
    if(this.lastImage != undefined || this.lastImage == '')
      return this._sanitizer.bypassSecurityTrustStyle('url('+this.lastImage+')');
  }

  ionViewWillLeave() {
    this.log.log("leaving page");
    this.log.log(this.globals.localMessageJson.chroma.camara.off);
    if(!this.liveMode){
      this.log.log("stopping camera");
      this.cameraPreview.stopCamera();
    }
    else{
      this.seriously.destroyChroma();
      this.webCameraService.stopCamera();
    }
  }

  drawAlertDialog(title:string, subTitle:string, buttons:Array<any>, show?:boolean ){
    let dialog = this.alertController.create({
      title: title,
      enableBackdropDismiss : false,
      subTitle: subTitle,
      buttons: buttons,
      cssClass: 'alertCustomCss'
    });
    if (this.globals.isDebugMode || show){
      dialog.present();
    }

  }
}
