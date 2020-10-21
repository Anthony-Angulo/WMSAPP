import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { RecepcionBeefPage } from './recepcion-beef.page';

const routes: Routes = [
  {
    path: '',
    component: RecepcionBeefPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [RecepcionBeefPage]
})
export class RecepcionBeefPageModule {}
