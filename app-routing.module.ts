import { TestComponent } from './tutorial/components/test/test.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import * as Component from './tutorial/components';
import { MainpageComponent } from './project3/mainpage/mainpage.component';
import { ShoppingComponent } from './project3/shopping/shopping.component';
import { ComparisonComponent } from './project3/comparison/comparison.component';

import { DocumentComponent } from './project3/document/document.component';
import { HomepageComponent } from './project3/homepage/homepage.component';


const routes: Routes = [
  // { path: 'home', component: Component.HomePageComponent },
  // { path: 'playground', component: Component.PlaygroundComponent },
  // { path: 'Test', component: TestComponent },
  // { path: 'SelectVendor', component: SelectVendorComponent },
  // { path: 'Shopping_cart', component: ShoppingCartComponent },
  // { path: 'Comparison', component: ComparisonComponent }
  { path: '', component: HomepageComponent },
  { path: 'homepage', component: HomepageComponent },
  { path: 'document', component: DocumentComponent },
  { path: 'mainpage', component: MainpageComponent },
  { path: 'shopping', component: ShoppingComponent },
  { path: 'playground', component: Component.PlaygroundComponent },
  { path: 'test', component: TestComponent },
  { path: 'Comparison', component: ComparisonComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
