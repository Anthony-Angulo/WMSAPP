import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AbarrotesBatchPage } from './abarrotes-batch.page';

const routes: Routes = [
  {
    path: '',
    component: AbarrotesBatchPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AbarrotesBatchPage]
})
export class AbarrotesBatchPageModule {}
