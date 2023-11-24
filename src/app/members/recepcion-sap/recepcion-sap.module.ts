import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { RecepcionSapPage } from './recepcion-sap.page';

const routes: Routes = [
  {
    path: '',
    component: RecepcionSapPage
  }
];

@NgModule({
  declarations: [RecepcionSapPage],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  // schemas: [CUSTOM_ELEMENTS_SCHEMA],
  
})
export class RecepcionSapPageModule {}
