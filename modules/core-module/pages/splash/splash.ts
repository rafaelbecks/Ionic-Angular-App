import * as moment from 'moment';
import {
    AlertController,
    NavController,
    NavParams,
    Platform
    } from 'ionic-angular';
import { Component, OnInit } from '@angular/core';
import { GetDataService } from '@shared/providers/remote/getData.service';
import { Globals } from '@shared/providers/globals/globals';
import { HomePage } from '../home/home';
import { Logger } from '@shared/providers/logging/logger.service';

@Component({
  selector: 'page-splash',
  templateUrl: 'splash.html',
  providers: [ ]
})

export class SplashPage implements OnInit {

    public isShow = false;
    public dateTime: any = {};
    public target_date: Date;
    public isWeddingDay:boolean = true;
    private counterInterval:number;
    

    constructor(public navCtrl: NavController, 
        public navParams: NavParams, 
        public platform: Platform,
        public alertCtrl: AlertController,
        public globals: Globals,
        private getDataService: GetDataService,
        private log: Logger
     ) {
         this.log.fileName = "splash.ts";
    }

    ngOnInit() {
        // se "observa" el objeto que ha informa sobre la data, sea de local o remota
        this.getDataService.dataLoaded.subscribe(state => {
            this.log.log("custom event working " + state);
            if (state){ // si ya se obtuvo data se muestra el contador y se habilita la transicion de ventana
                this.isEndOfWeddingDay();
                this.showCounter();
                setTimeout(() => {
                    this.log.log(`${this.navCtrl.getActive().name} tiempo: ${this.globals.remoteJson.delay}`);

                    if (this.globals.localMessageJson.wedding.finished && this.calculateShutdownTime() && !this.globals.isDebugMode) {
                        this.showAlertAndShutdown(this.globals.localMessageJson.appCloseMsg.title, this.globals.localMessageJson.appCloseMsg.subTitle, this.globals.localMessageJson.appCloseMsg.button);
                    } else {
                        if (this.navCtrl.getActive().name === 'SplashPage') {
                            this.navCtrl.push("menu");
                        }
                        this.isTime();
                    }
                },this.globals.remoteJson.delay);
            }
          })
    }

    showCounter() {
        if (this.platform.is('android')) {
            this.counterInterval = setInterval(() => {
                this.calculateTime();
            },1000);
        } else {
            this.calculateTime();
            this.globals.remoteJson.delay = this.globals.remoteJson.delay / 2;
        }
    }

    calculateTime() {

        const current_date = new Date();
        // Obtener fecha parametrizada
        this.target_date = new Date(this.globals.remoteJson.fecha);

        // Comparar fechas parametrizada con la actual
        let seconds_left = (this.target_date.getTime() - current_date.getTime()) / 1000;
     
        // Calculo del tiempo (dias, horas, minutos, segundos)
        const days = parseInt((seconds_left / 86400).toString());
        seconds_left = seconds_left % 86400;
         
        const hours = parseInt((seconds_left / 3600).toString());
        seconds_left = seconds_left % 3600;
         
        const minutes = parseInt((seconds_left / 60).toString());
        const seconds = parseInt((seconds_left % 60).toString());

        this.dateTime = {
            days: days,
            hours: hours ,
            minutes: minutes,
            seconds: seconds
        }

        let boda = moment(this.target_date);
        let now = moment(new Date());

        let time = parseInt((boda.diff(now, 'hours')).toString()) * -1 ;

        if(time >= this.globals.remoteJson.shutdown) {  
            this.globals.localMessageJson.wedding.finished = true;
            if (this.counterInterval != null){
                clearInterval(this.counterInterval);
            }
        } 
    }

    isEndOfWeddingDay(){

        let weddingDate = new Date(this.globals.remoteJson.fecha);
        
        let current_date  = new Date();
        current_date.setHours(0,0,0,0);

        if (current_date > weddingDate){
            this.isWeddingDay = false;
        }
    }

    // funcion para verificar si han pasado mas de 48 desde la finalizacion del evento para anular el uso de la app
    calculateShutdownTime (){

        const current_date = new Date();
        // obtenemso 48h despues de la fecha actual
        let currentDateAfter48h :number = current_date.setHours( current_date.getHours()+48);

        // obtenemso 48h despues de la fecha de la boda
        let weddingDateAfter48h :number = this.target_date.setHours( this.target_date.getHours()+48);
 
        return currentDateAfter48h > weddingDateAfter48h;
    }

    isTime() {

        this.log.log(`Aplicacion disponible para el publico desde remoto: ${this.globals.remoteAlbumDestino.publico}`);
        // public con valor false indica que la app no está abierta al público.
        if(this.dateTime.minutes >= 0 && this.globals.remoteAlbumDestino.publico == false && this.isShow == false && !this.globals.isDebugMode) {

            this.isShow = true;
        
            let dias = ( (this.dateTime.days > 0) ? this.dateTime.days + this.globals.localMessageJson.wedding.days : ' ');
            let horas = ( (this.dateTime.hours > 0) ? this.dateTime.hours + this.globals.localMessageJson.wedding.hours : ' ');

            // variable "tiempo" usada internamente en el string template del subtitulo
            let tiempo = dias + horas + this.dateTime.minutes;

            let subitutlo = this.globals.localMessageJson.waitForWeddingDateMsg.subTitle; // es una cadena de localMessages.json. Ej: waitForWeddingDateMsg.subTitle
            let sub = eval('`'+subitutlo+'`');

            this.showAlertAndShutdown(this.globals.localMessageJson.waitForWeddingDateMsg.title, sub, this.globals.localMessageJson.waitForWeddingDateMsg.button);           
        }     
    }

    showAlertAndShutdown (title:string, sub:string, message:string) {
        let alert = this.alertCtrl.create({
            title: title,
            subTitle: sub,
            buttons: [{
                text: message,
                handler: data => {
                    this.platform.exitApp();
                }
            }],
            enableBackdropDismiss : false,
            cssClass: 'alertCustomCss'
        });
        alert.present();
    }

    tap() {
        this.isShow = false;
        if (this.dateTime.minutes <= 0 && this.globals.localMessageJson.wedding.finished == false) {
            this.log.log("--> main");
            this.navCtrl.push("home");
        } else if(this.dateTime.minutes >= 0 && this.globals.localMessageJson.wedding.finished == false) {
            this.isTime()
        } else if (this.globals.localMessageJson.wedding.finished && this.calculateShutdownTime()) {
            this.showAlertAndShutdown(this.globals.localMessageJson.appCloseMsg.title, this.globals.localMessageJson.appCloseMsg.subTitle, this.globals.localMessageJson.appCloseMsg.button);
        }
    }

}
