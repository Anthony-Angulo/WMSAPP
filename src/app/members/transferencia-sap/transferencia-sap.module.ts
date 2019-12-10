import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TransferenciaSapPage } from './transferencia-sap.page';

const routes: Routes = [
  {
    path: '',
    component: TransferenciaSapPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TransferenciaSapPage]
})
export class TransferenciaSapPageModule {}
