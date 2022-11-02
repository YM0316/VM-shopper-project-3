// Angular
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule} from '@ng-bootstrap/ng-bootstrap';

// NGRX Store
import { StoreModule } from '@ngrx/store';
import { metaReducers, reducers, stateInit } from '@store/reducer';

//NGX Navbar
import { NgxNavbarModule} from 'ngx-bootstrap-navbar';

// Third Party
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

// Caloudi
import { JwtPublicInterceptor } from '@core/interceptor/jwt-public.interceptor';
import { PrimengModule } from './base/prime-module/primeng.module';
import * as LayoutComponents from './base/components/layout';
import * as PageComponents from './tutorial/components';
import { LanguageService } from '@core/service';

import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core';
import { TestComponent } from './tutorial/components/test/test.component';
import { MainpageComponent } from './project3/mainpage/mainpage.component';
// MatSelect
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { ShoppingComponent } from './project3/shopping/shopping.component';
import { ComparisonComponent } from './project3/comparison/comparison.component';


import { projectService } from './project3/project_service';
import { HomepageComponent } from './project3/homepage/homepage.component';
import { DocumentComponent } from './project3/document/document.component';
import { MenuComponent } from './base/components/layout/menu/menu.component';
import { MenuNewComponent } from './base/components/layout/menu-new/menu-new.component';

//check box
import { CheckboxModule } from 'primeng/checkbox';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponents.MenubarComponent,
    PageComponents.HomePageComponent,
    PageComponents.PlaygroundComponent,
    TestComponent,
    MainpageComponent,
    ShoppingComponent,
    ComparisonComponent,
    HomepageComponent,
    DocumentComponent,
    MenuComponent,
    MenuNewComponent,
  ],
  imports: [
    NgbModule,
    NgxNavbarModule,
    NgxPageScrollCoreModule,
    BrowserModule,
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    LoggerModule.forRoot({
      level: NgxLoggerLevel.DEBUG,
      timestampFormat: '[HH:mm:ss.SSS]',
      enableSourceMaps: true,
      serverLogLevel: NgxLoggerLevel.ERROR,
    }),
    AppRoutingModule,
    PrimengModule,
    HttpClientModule,
    TranslateModule.forRoot(),
    StoreModule.forRoot(reducers, {
      initialState: stateInit,
      metaReducers: metaReducers,
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
        strictStateSerializability: true,
        strictActionSerializability: true,
        strictActionTypeUniqueness: true,
      },
    }),
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSliderModule,
    CheckboxModule,

  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtPublicInterceptor, multi: true },
    { provide: DatePipe },
    { provide: LanguageService, useClass: LanguageService },
    projectService
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
