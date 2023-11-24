import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ScannLabelPage } from './scann-label.page';

const routes: Routes = [
  {
    path: '',
    component: ScannLabelPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ScannLabelPage]
})
export class ScannLabelPageModule {}
