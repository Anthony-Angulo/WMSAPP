import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PartialInventoryPage } from './partial-inventory.page';

const routes: Routes = [
  {
    path: '',
    component: PartialInventoryPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PartialInventoryPage]
})
export class PartialInventoryPageModule {}
