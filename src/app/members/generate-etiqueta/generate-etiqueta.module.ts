import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { GenerateEtiquetaPage } from './generate-etiqueta.page';

const routes: Routes = [
  {
    path: '',
    component: GenerateEtiquetaPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [GenerateEtiquetaPage]
})
export class GenerateEtiquetaPageModule {}
