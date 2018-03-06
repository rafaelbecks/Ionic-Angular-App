import { Globals } from '../globals/globals';
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { Logger } from './../logging/logger.service';
import { Observable } from 'rxjs/Rx';
import { Platform } from 'ionic-angular';
import { File } from '@ionic-native/file';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class UploadDataService {   
    
    endpoint:string = 'destino/?';

    constructor(public http: Http, public platform: Platform, private globals: Globals, private log: Logger,private file: File) {
        this.log.fileName = "uploadData.service.ts";
    }

    uploadBASE64(base64, album){
        let URL = this.globals.urlBase + this.globals.serviceBase + album;
        return new Promise((resolve, reject)=>{
            this.http.post(URL, {base64IMG : base64}, {}).toPromise().then(res => { // Success
                resolve(res.json());
            });
        }).catch((response) => {
            this.log.error(response);
        });
    }

    postUploadPhotoIOS(path,album) {
        if(localStorage.debugFlag != "true") {
            // window.resolveLocalFileSystemURL("file://"+path,  function(fileEntry) { 
            //     this.getFileContentAsBase64(fileEntry,function(object) {
            //         URL = serviceBase + ruta + album;
            //         window.CordovaHttpPlugin.post(URL, object, {}, function(response) {

            //         }, function(response) {
            //             this.log.log(response);
            //         });
            //     });
            // }, function(e){
            //     this.log.log(e);
            // });
        }
    }

}
