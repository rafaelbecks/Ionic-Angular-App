import { Component, OnInit } from '@angular/core';
import { ENV } from '@env/environment.dev';
import { GetDataService } from '@shared/providers/remote/getData.service';
import { Globals } from '@shared/providers/globals/globals';
import { Logger } from '@shared/providers/logging/logger.service';
import { Observable } from 'rxjs/Rx';
import { Platform } from 'ionic-angular';
import { SplashPage } from '@core/pages/splash/splash';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { ScreenOrientation } from '@ionic-native/screen-orientation';


@Component({
  templateUrl: 'app.html',
  providers: []
})
export class Tecnoboda implements OnInit {

  rootPage:any;

  constructor(private platform: Platform, private statusBar: StatusBar, 
    private splashScreen: SplashScreen, 
    private getDataService: GetDataService,
    private log: Logger, public globals: Globals,
    private screenOrientation: ScreenOrientation) {
      this.log.fileName = "app.component.ts";
  }

  ngOnInit(): void {

    this.globals.isDebugMode = ENV.isDebugMode;
    
    this.log.log(`Is Debug Mode: ${this.globals.isDebugMode}`);

    this.getDataService._dataLoaded.next(false);

    // llamada a servicio para carga de datos local
    this.getDataService.getStaticData();

    // llamada a servicio para carga de stickers
    this.getDataService.getStickerData();

    this.platform.ready().then(() => {
      document.addEventListener("deviceready", () => {  
          this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
          this.statusBar.styleDefault();     
          this.getConfigData();
      });

    });
  }

  getConfigData() {
    // llamada a servicio que obtiene la data de remoto o de local
    this.getDataService.getConfigData();
    // suscripcion a observable propio para detectar si la data fue cargada
    this.getDataService.dataLoaded.subscribe(state => {
      if (state){ // solo cuando se obtenga un true continua el flujo
        this.splashScreen.hide();
        this.rootPage = SplashPage;
      }
    }, (err) =>
  {
    this.rootPage = SplashPage;
  });
  }
}

