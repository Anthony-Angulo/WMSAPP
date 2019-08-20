import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { InventoryOrderDetailPage } from './inventory-order-detail.page';

const routes: Routes = [
  {
    path: '',
    component: InventoryOrderDetailPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [InventoryOrderDetailPage]
})
export class InventoryOrderDetailPageModule {}
