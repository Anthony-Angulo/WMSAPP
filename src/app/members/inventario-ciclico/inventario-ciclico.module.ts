import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { InventarioCiclicoPage } from './inventario-ciclico.page';

const routes: Routes = [
  {
    path: '',
    component: InventarioCiclicoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [InventarioCiclicoPage]
})
export class InventarioCiclicoPageModule {}
