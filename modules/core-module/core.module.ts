import { HomePage } from './pages/home/home';
import { IonicModule } from 'ionic-angular';
import { NgModule } from '@angular/core';
import { SplashPage } from './pages/splash/splash';
import { AboutPage } from './pages/about/about';

@NgModule({
    declarations: [ HomePage, SplashPage, AboutPage ],
    imports: [ IonicModule.forRoot(HomePage) ],
    providers: [ ],
    entryComponents: [
        HomePage,
        SplashPage,
        AboutPage
    ],
    exports: [ HomePage, SplashPage, AboutPage ]
})
export class CoreModule {}