import { CloseMessage } from './closeMessage';

// objeto model para el json de configuracion
export class Info {
    titulo: string;
    novios: string;
    fecha: Date;
    lugar: string;
    fecha_texto: string;
    color: string;
    iniciales: string;
    hashtags: Array<string>;
    items: Array<string>;
    shutdown: number;
    delay: number;
    arCollection: string;
    arMobileDirectory: string;
    imagesAR: Array<string>;
    videosAR: Array<string>;
    minis: Array<string>;
    appCloseMsg: CloseMessage;
    share: string;
    urlBase: string;
    colorPrimario: string;
    colorSecundario: string;
}