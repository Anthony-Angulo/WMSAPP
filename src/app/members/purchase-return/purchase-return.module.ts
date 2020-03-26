import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PurchaseReturnPage } from './purchase-return.page';

const routes: Routes = [
  {
    path: '',
    component: PurchaseReturnPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PurchaseReturnPage]
})
export class PurchaseReturnPageModule {}
