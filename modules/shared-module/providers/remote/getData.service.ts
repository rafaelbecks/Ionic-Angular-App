import * as localMessages from '@assets/data/localMessages.json';
import * as localStickers from '@assets/data/stickers.json';
import { AlbumResponse } from '@core/models/albumResponse';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Globals } from '../globals/globals';
import { HttpClient } from '@angular/common/http';
import { Info } from '@core/models/info';
import { Injectable } from '@angular/core';
import { Logger } from './../logging/logger.service';
import { NativeStorage } from '@ionic-native/native-storage';
import { Observable } from 'rxjs/Rx';
import { SplashScreen } from '@ionic-native/splash-screen';
import 'rxjs/add/operator/toPromise';
import { AlertController } from 'ionic-angular';

@Injectable()
export class GetDataService {
    debugParam: string = '?debug=';
    endpoint:string = 'destino/';

    constructor(private httpclient: HttpClient, private globals: Globals, private nativeStorage: NativeStorage, private log: Logger,private alertCtrl: AlertController, private splash: SplashScreen) {
        this.log.fileName = "getData.service.ts";
    }

    /* 
    Objeto para crear observable propio para la obtencion de data
    El observable es "observado" en SplashPage.ngOnInit
    */ 
    public _dataLoaded = new BehaviorSubject(false);
    get dataLoaded(): Observable<any>{
        return this._dataLoaded.asObservable();
    }

    // funcion para leer archivo json local con textos estáticos
    getStaticData(){
        this.globals.localMessageJson = (<any>localMessages) ;
    }

    getStickerData(){
        this.globals.localStickers = (<any>localStickers) ;
    }
    
    // funcion para obtener la data inicial de local o remoto
    getConfigData(){
        this.nativeStorage.getItem('remoteJson')
            .then(
                remoteJson  => {
                    this.globals.remoteJson = remoteJson;
                    this.globals.urlBase = this.globals.remoteJson.urlBase;
                    this.getAlbumDestino();
            }).catch((error) => {
                this.httpclient.get<Info>(this.globals.localMessageJson.configUrl)
                .subscribe(
                    remoteJson => {
                        // después de obtener el valor de remoto, se almacena de forma local
                        this.nativeStorage.setItem('remoteJson',remoteJson)
                        .then(ok => {
                            this.globals.remoteJson = remoteJson;
                            this.globals.urlBase = this.globals.remoteJson.urlBase;
                            this.getAlbumDestino();
                        })
                        .catch(error => this.log.error(`Error storing item ${error}`));
                    },
                    err => {
                        this.log.error('Error al leer valores de servidor');
                    }
                  );        
            });  
    }

    getAlbumDestino(){
        let albumDestino = this.globals.urlBase + this.globals.serviceBase + this.endpoint +  this.debugParam + this.globals.isDebugMode;
        this.log.log(`Fetch: ${albumDestino}`);
        this.httpclient.get<AlbumResponse>(albumDestino).subscribe(
            remoteJson => {
                this.globals.remoteAlbumDestino = remoteJson.mensaje[0];

                if (this.globals.remoteAlbumDestino.hasOwnProperty('debug')){
                    this.globals.isDebugMode = this.globals.remoteAlbumDestino.debug;
                }
                this._dataLoaded.next(true); // ahora el observable permitirá ejecuciones
            },
            err => {
                this.log.error('Fallo obteniendo album destino: ' + err);
                this.showConnectionErrorAlert();
            }
        );
    }

    showConnectionErrorAlert()
    {
        this.splash.hide();

        let alert = this.alertCtrl.create({
            title: "Error",
            subTitle: "Ocurrió un erro al intentar conectarse con el servidor, las imágenes no podrán ser subidas",
            buttons: [{
                text: "Ok",
                handler: data => {
                    this.globals.isDebugMode = true;
                    this._dataLoaded.next(true); // ahora el observable permitirá ejecuciones    
                }
            }],
            enableBackdropDismiss : false,
            cssClass: 'alertCustomCss'
        });
        alert.present();
    }
}