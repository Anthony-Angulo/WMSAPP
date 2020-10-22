import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { EtiquetasTransferenciasPage } from './etiquetas-transferencias.page';

const routes: Routes = [
  {
    path: '',
    component: EtiquetasTransferenciasPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [EtiquetasTransferenciasPage]
})
export class EtiquetasTransferenciasPageModule {}
