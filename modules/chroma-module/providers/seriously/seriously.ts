import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { Logger } from '@shared/providers/logging/logger.service';
import '@assets/js/seriously.js';
import 'rxjs/add/operator/map';

declare var Seriously: any;


@Injectable()
export class SeriouslyProvider {

    public seriously : any;
    public canvas: HTMLCanvasElement;
    public video: HTMLVideoElement;

  constructor(public http: Http, private log: Logger) {
    this.log.fileName = "seriously.ts";
  }


    /*
     Instanciación de seriously y configuración de chroma key effect
     El proceso es el siguiente:
     - Se obtiene el elemento video (source) que ya viene con el stream de la cámara (ver webCameraProvider)
     - Se obtiene el target: el elemento canvas donde estará renderizado la imagen procesada por seriously
     - Se establecen configuraciones varias, el atributo 'screen' de chroma.screen establece el color a eliminar
     - clipWhite debe ser siempre mayor a clipBlack
     - El atributo precision es para establecer la cantidad de eliminación de color, si este valor es muy alto, colores como el blanco 
     empiezan a desaparecer.
     - El blending de los fondos está definido en el componente (chroma-key.component)
    */

    initChromaKey()
    {

        //Verificando existencia de chroma key, si es correcto, se destruye instancia seriously
        if(this.seriously != undefined)
        {
          this.destroyChroma();
        } 

        this.seriously = new Seriously();
        this.canvas = <HTMLCanvasElement> document.getElementById("seriously");
        this.video = <HTMLVideoElement> document.getElementById("video");
        this.initWebGL();
        let target = this.seriously.target('#seriously');
        let chroma = this.seriously.effect('chroma');
        let source = this.seriously.transform('reformat');
        source.source = this.video;
        source.mode = 'cover';
        source.width = target.width;
        source.height = target.height;
        source.mode = 'cover';
        source.width = target.width;
        source.height = target.height;
        chroma.weight = 1.32;
        chroma.balance = 0;
        chroma.screen = 'rgb(77, 239, 41)';
        chroma.clipWhite = 0.85;
        chroma.clipBlack = 0.5125;
        chroma.precision = 0.01;
        chroma.source = source;
        target.source = chroma;
        this.seriously.go();    
    }

    /*
     Configuración de contexto webgl chroma key. Tanto el width y height del canvas como el de contexto del viewport
     deben ser el mismo para evitar estiramientos de la imagen
    */
   
    initWebGL()
    {

        this.canvas.height = screen.height;
        this.canvas.width =  screen.width;

      let context;
      let options = {
        preserveDrawingBuffer: true
      };
      try
      {
          context = this.canvas.getContext('webgl', options);
      }
      catch (expError)
      {
          this.log.log(expError)
      }

      if (!context)
      {
        try
        {
          context = this.canvas.getContext('experimental-webgl', options);
        }
        catch (error)
        {
            this.log.error(error);
        }
      }
        // Estableciendo dimensiones del contexto del canvas de seriously
        context.viewport(0, 0, screen.width, screen.height);
    }

    getCanvasURI()
    {
      return new Promise<string>((resolve,reject)=>
      {
       resolve(this.canvas.toDataURL("image/png", 1.0));        
      })
    }

    destroyChroma()
    {
      if(this.seriously != undefined)
        this.seriously.destroy();
    }


}
