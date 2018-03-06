import { FileHelper } from './providers/file-service/file-helper';
import { GetDataService } from './providers/remote/getData.service';
import { Globals } from './providers/globals/globals';
import { Logger } from './providers/logging/logger.service';
import { NgModule } from '@angular/core';
import { OrientationEventProvider } from './providers/orientation-event/orientation-event';
import { UploadDataService } from './providers/remote/uploadData.service';



@NgModule({
    declarations: [  ],
    imports: [ ],
    providers: [ FileHelper, Globals, OrientationEventProvider, UploadDataService, GetDataService, Logger ],
})
export class SharedModule {}