import { Album } from '@core/models/album';
import { Info } from '@core/models/info';
import { Injectable } from '@angular/core';
import { LocalMessages } from '@core/models/localMessages';
import { Stickers } from '@core/models/stickers';



@Injectable()
export class Globals {
  serviceBase: string                   = 'assets/api/public/album/';
  localMessageJson: LocalMessages       = null;
  localStickers: Stickers               = null;
  remoteJson: Info                      = null;

  remoteAlbumDestino: Album             = null;
  urlBase: string                       = '';
  
  lastImage: string                     = '';
  lastOrientation: number               = 0;
  backgroundElement: HTMLImageElement   = undefined;
  gallery:Array<Object>                 = [];

  isDebugMode:boolean                   = false;
  showDebugInfo                         = true;
  liveMode                              = false;

  galleryDirectoryOnDevice:string       = 'Pictures/TecnoBoda';
  photoNameBase:string                  = 'tecnoboda';

  defaultCameraAudio                    = 'assets/audio/camera.mp3';
  activateZone                          = true;


  public static isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
}