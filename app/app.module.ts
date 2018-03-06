import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { AugmentedRealityModule } from './../modules/ar-module/ar.module';
import { Base64ToGallery } from '@ionic-native/base64-to-gallery';
import { BrowserModule } from '@angular/platform-browser';
import { ChromaKeyPage } from '@chroma/pages/chroma-key/chroma-key';
import { ChromaModule } from '@chroma/chroma.module';
import { CoreModule } from '@core/core.module';
import { Device } from '@ionic-native/device';
import { EditionPage } from '@chroma/pages/edition/edition';
import { ErrorHandler, NgModule } from '@angular/core';
import { File } from '@ionic-native/file';
import { GalleryPage } from '@chroma/pages/gallery/gallery';
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';
import { HomePage } from '@core/pages/home/home';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { ModalGalleryPage } from '@chroma/pages/gallery/modalGallery';
import { NativeStorage } from '@ionic-native/native-storage';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Screenshot } from '@ionic-native/screenshot';
import { SharedModule } from '@shared/shared.module';
import { SocialSharing } from '@ionic-native/social-sharing';
import { SplashPage } from '@core/pages/splash/splash';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Tecnoboda } from './app.component';
import 'hammerjs';
import 'hammer-timejs';
import { AboutPage } from '@core/pages/about/about';

export class CustomHammerConfig extends HammerGestureConfig {
  overrides = {
    'rotate': { enable: true } 
  }
}

@NgModule({
  declarations: [
    Tecnoboda
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    ChromaModule,
    SharedModule,
    CoreModule,
    AugmentedRealityModule,
    IonicModule.forRoot(Tecnoboda, {}, {
      links: [
        {component: HomePage, name:'menu'},
        {component: SplashPage, name:'splash'},
        {component: ChromaKeyPage, name:'chroma'},
        {component: GalleryPage, name:'gallery'},
        {component: ModalGalleryPage, name: 'photoSlide'},
        {component : EditionPage, name: 'edition'},
        {component: AboutPage, name:'about'}
      ]
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    Tecnoboda
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Device,
    Base64ToGallery,
    File,
    AndroidFullScreen,
    NativeStorage,
    Screenshot,
    SocialSharing,
    ScreenOrientation,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AndroidPermissions,
    {provide: HAMMER_GESTURE_CONFIG, useClass: CustomHammerConfig}
  ]
})
export class AppModule {}
