import { Album } from './album';
// Model que representa la respuesta general del servidor
export class AlbumResponse {
    resultado:string;
    mensaje:Array<Album>;
}