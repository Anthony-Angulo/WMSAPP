import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { EtiquetasPage } from './etiquetas.page';

const routes: Routes = [
  {
    path: '',
    component: EtiquetasPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [EtiquetasPage]
})
export class EtiquetasPageModule {}
