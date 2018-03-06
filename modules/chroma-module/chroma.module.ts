import { ChromaKeyPage } from './pages/chroma-key/chroma-key';
import { DirectivesModule } from '@directives/directives.module';
import { EditionPage } from './pages/edition/edition';
import { GalleryPage } from './pages/gallery/gallery';
import { IonicModule } from 'ionic-angular';
import { ModalGalleryPage } from './pages/gallery/modalGallery';
import { NgModule } from '@angular/core';
import { OrientationEventProvider } from '@shared/providers/orientation-event/orientation-event';
import { SeriouslyProvider } from './providers/seriously/seriously';
import { UploadDataService } from '@shared/providers/remote/uploadData.service';
import { WebCameraProvider } from './providers/chroma-key/web-camera';



@NgModule({
    declarations: [ChromaKeyPage, GalleryPage, ModalGalleryPage, EditionPage],
    imports: [
        DirectivesModule,
        IonicModule.forRoot(ChromaKeyPage),
    ],
    providers: [ 
        WebCameraProvider,
        UploadDataService,
        SeriouslyProvider,
        OrientationEventProvider],
    entryComponents: [
        ChromaKeyPage,
        GalleryPage,
        ModalGalleryPage,
        EditionPage
    ],
    exports: [ChromaKeyPage, GalleryPage, ModalGalleryPage, EditionPage]
})
export class ChromaModule {}