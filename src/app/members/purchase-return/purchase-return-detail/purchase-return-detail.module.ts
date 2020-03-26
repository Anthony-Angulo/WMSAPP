import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PurchaseReturnDetailPage } from './purchase-return-detail.page';

const routes: Routes = [
  {
    path: '',
    component: PurchaseReturnDetailPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PurchaseReturnDetailPage]
})
export class PurchaseReturnDetailPageModule {}
