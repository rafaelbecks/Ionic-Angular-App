import { Chroma } from '@core/models/chroma';
import { CloseMessage } from '@core/models/closeMessage';
import { Wedding } from '@core/models/wedding';


export class LocalMessages {
    appCloseMsg: CloseMessage;
    waitForWeddingDateMsg: CloseMessage;
    wedding:Wedding;
    chroma:Chroma;
    configUrl:string;
}