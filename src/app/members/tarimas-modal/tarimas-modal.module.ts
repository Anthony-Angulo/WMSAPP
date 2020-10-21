import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TarimasModalPage } from './tarimas-modal.page';

const routes: Routes = [
  {
    path: '',
    component: TarimasModalPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TarimasModalPage]
})
export class TarimasModalPageModule {}
