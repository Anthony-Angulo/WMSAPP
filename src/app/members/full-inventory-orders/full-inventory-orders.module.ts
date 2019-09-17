import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FullInventoryOrdersPage } from './full-inventory-orders.page';

const routes: Routes = [
  {
    path: '',
    component: FullInventoryOrdersPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [FullInventoryOrdersPage]
})
export class FullInventoryOrdersPageModule {}
