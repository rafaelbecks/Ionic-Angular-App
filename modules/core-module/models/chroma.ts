import { CloseMessage } from '@core/models/closeMessage';

export class Chroma {
    camara:Camara;
    gallery:Gallery;
}

class Camara {
    on:string;
    off:string;
    pleaseWait:string;
    filtersText:string;
    chromaText:string;
    backgroundSelect: string;
}

class Gallery {
    noPhotos:CloseMessage
}