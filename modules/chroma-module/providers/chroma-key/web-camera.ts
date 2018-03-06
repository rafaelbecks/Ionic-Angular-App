import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { Logger } from '@shared/providers/logging/logger.service';
import { SeriouslyProvider } from '../../providers/seriously/seriously';
import 'rxjs/add/operator/map';

declare var window: {plugins : {screensize}};

// Servicio de manipulación de webCamera que se instancia en la etiqueta video con id #video

@Injectable()
export class WebCameraProvider {

   public cameras:Array<MediaDeviceInfo>;
   public constraints:MediaStreamConstraints;
   public localStream:MediaStream;
   public localStreamTrack: MediaStreamTrack;
   public videoElement:any;

  constructor(public http: Http, public seriously: SeriouslyProvider,private log: Logger) {
    this.log.fileName = "web-camera.ts";
    this.log.log('Hello WebCameraProvider Provider');
  }

  //Función para iniciar el streaming de cámara, asociarlo al <video> element y llamar al servicio de seriously
  // Recibe loader para ocultar el loader ya iniciado en el componente antes de iniciar el servicio

  initCamera()
  {

    return new Promise((resolve,reject) => {      
       navigator.mediaDevices.enumerateDevices()
      .then((deviceInfos) => 
      {
        //Filtrando los dispositivos para tipo 'videoinput', es decir cámaras (normalmente 0 cámara frontal, 1 cámara trasera)
        this.cameras = deviceInfos.filter(function(device){       
          return device.kind === 'videoinput'
        });

        // Constraints por defectos (luego de obtener configuraciones son cambiadas)
        this.constraints = {
          audio: false,
          video: {}
        }

        // Si la cámara seleccionada está indefinida, se usa la cámara trasera por defecto. Es guardada en localStorage
        // para proximas inicializaciones de la app
        if (localStorage.camera == undefined)
        {
          localStorage.camera = 1;
        }

        // ID de cámara (dispositivo) seleccionada


        // Constraints para cámara trasera (resoluciones desde 320 hasta 2560 según el dispositivo, por eso se establecen varias)
        if (localStorage.camera == 1)
        {
          this.constraints.video = {
            
            width: { min: 1024, ideal: 1280, max: 1920 },
            height: { min: 776, ideal: 720, max: 1080 },
            facingMode: { exact: "environment" },
            aspectRatio: { ideal: 1.7777777778 }
          }
        }
        //Constraints por defecto para cámara delantera
        if(localStorage.camera == 0)
        {
          this.constraints = {
            audio: false,
            video: { 
               facingMode: { exact: "user" }
            }          
          };
        }  
        // Obteniendo el streaming de video de la cámara segun constrainst previamente establecidas, es llamada la función gotMedia para
        // obtener capabilities y ajustar constrainsts
        navigator.mediaDevices.getUserMedia(this.constraints)
          .then((mediaStream) => { 
            this.localStream = mediaStream;
            this.videoElement = document.getElementById("video");
            this.videoElement.srcObject = mediaStream;

            //Obteniendo localStreamTrack para obtener capabilities
            this.localStreamTrack = this.localStream.getVideoTracks()[0];
            
            resolve(true);

          }, (error) => {
            this.log.error("Error en llamada getUserMedia: ", error); 
            reject(error);
          });
      })
      .catch(function(error)
      {
        reject('enumerateDevices error:' + error);
      });
    });
   
  }

  // Se detienen todos los tracks abiertos del streaming de video de camara
  stopCamera()
  {
    if (this.localStream != undefined){
      this.localStream.getTracks().forEach(
        function(track)
        {
          track.stop()
        }
      );
    } else {
      this.log.log("this.localStream es undefined");
    }
  }


  aspectRatioResizer(srcWidth, srcHeight, maxWidth, maxHeight)
  {
    let ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return { width: Math.round(srcWidth*ratio), height: Math.round(srcHeight*ratio) };
  }

  rotateBase64Image(base64data,deg) {
    return new Promise((res,rej)=>{

      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext("2d");
      canvas.width = screen.height;
      canvas.height = screen.width;

      let image = new Image();
      image.onload = ()=> {
        switch(deg) {
          default :
          case 0 :
            canvas.width = image.width;
            canvas.height=  image.height;
            ctx.rotate(deg * Math.PI / 180);
            ctx.drawImage(image, 0, 0);
            break;
          case 90 :
            canvas.width = image.height;
            canvas.height =  image.width;
            ctx.rotate(deg * Math.PI / 180);
            ctx.drawImage(image, 0, -image.height);
            break;
          case 180 :
            canvas.width = image.width;
            canvas.height =  image.height;
            ctx.rotate(deg * Math.PI / 180);
            ctx.drawImage(image, -image.width, -image.height);
            break;
          case 270 :
          case -90 :
            canvas.width = image.height;
            canvas.height =  image.width;
            ctx.rotate(deg * Math.PI / 180);
            ctx.drawImage(image, -image.width, 0);
            break;
        };
          res(canvas.toDataURL());
      };
      image.src = base64data;
  
    });

}

  changeZoom = function(zoomValue,ranges)
  {

     // Se recalcula el rango de zoom de cámara desde la nativa a la cámara web. La cámara nativa tiene un rango de zoom diferente
     // y se hace una escala con la cámara web para mantener los datos del range que controlan el zoom
     
    let zoom = this.localStreamTrack.getCapabilities().zoom;

    let scale = (zoomValue - ranges.min) / (ranges.max - ranges.min);

    let z =  Math.round((scale * (zoom.max - zoom.min) + zoom.min));

    if(z % 2 == 0){
       if(z == zoom.max){
         z  = z -1 ;
       }else{
         z  = z +1 ;
       }
    }
     //Aplicando nuevas contrainsts de zoom
    return this.localStreamTrack.applyConstraints(
      {
        advanced: [
        {
          zoom: z
        }]
      })
      .catch(function(error)
      {
        this.log.error('Error, applyConstraints() error:', error);
      });
  }
  
}

