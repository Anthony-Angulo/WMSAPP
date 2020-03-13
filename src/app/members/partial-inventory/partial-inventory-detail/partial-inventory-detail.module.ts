import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PartialInventoryDetailPage } from './partial-inventory-detail.page';

const routes: Routes = [
  {
    path: '',
    component: PartialInventoryDetailPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PartialInventoryDetailPage]
})
export class PartialInventoryDetailPageModule {}
