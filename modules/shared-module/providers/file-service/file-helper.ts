import { AndroidPermissions } from '@ionic-native/android-permissions';
import { File } from '@ionic-native/file';
import { Globals } from './../globals/globals';
import { Injectable } from '@angular/core';
import { Logger } from './../logging/logger.service';

@Injectable()
export class FileHelper {

    constructor(public globals: Globals,
                private file: File,
                private log: Logger,
                private androidPermissions: AndroidPermissions){
        this.log.fileName = "file-helper.ts";
    }

    // refactorizar para extraer nombres de directorios
    getTecnobodaPictures(){
        this.file.listDir(this.file.externalRootDirectory, this.globals.galleryDirectoryOnDevice)
        .then(files => {
            for(let file of files){
                if(file.isDirectory != true){
                    if (file.name.indexOf(this.globals.photoNameBase) >= 0) {
                        localStorage.pictureData = file.nativeURL;
                        this.globals.gallery.push({src: file.nativeURL, shareURL : file.nativeURL });
                    }
                }
            }
            this.log.log(`Archivos añadidos al array gallery:`, this.globals.gallery);
        }, error => {
            this.log.error(`Error en promise listDir: ${error}.`);
        }).catch(error => {
            this.log.error('Error capturado en listDir',error);
        });
    }

    getLastPhoto()
    {
        return new Promise( (res,rej) =>{

            let pictures = [];

            this.file.listDir(this.file.externalRootDirectory, this.globals.galleryDirectoryOnDevice).then(files => {
                for(let file of files){
                    if(file.isDirectory != true){
                        if (file.name.indexOf(this.globals.photoNameBase) >= 0) {
                            pictures.push({src: file.nativeURL, shareURL : file.nativeURL });
                        }
                    }
                }
                console.log(pictures);
                if(pictures.length > 0)
                {
                    res(pictures[pictures.length - 1].src);
                }else
                {
                    rej(undefined);
                }
            });

        });
    }

    createDirectory()
    {
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
            (data) =>
            {
              this.file.checkDir(this.file.externalRootDirectory, this.globals.galleryDirectoryOnDevice).then(directory => {
                this.log.log("El directorio existe, no hace falta crearlo");
            },(err) => {
                this.file.createDir(this.file.externalRootDirectory, this.globals.galleryDirectoryOnDevice, false).then(data => {
                    this.log.log('Directorio creado en catch');
                  }).catch(err => {
                    this.log.error('Error! Create directory');
                  });
            });
        },(err)=>{this.log.log(err);});
    }
}