import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SurtidoSapPage } from './surtido-sap.page';

const routes: Routes = [
  {
    path: '',
    component: SurtidoSapPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SurtidoSapPage]
})
export class SurtidoSapPageModule {}
