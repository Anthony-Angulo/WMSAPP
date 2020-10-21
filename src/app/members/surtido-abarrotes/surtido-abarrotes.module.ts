import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SurtidoAbarrotesPage } from './surtido-abarrotes.page';

const routes: Routes = [
  {
    path: '',
    component: SurtidoAbarrotesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SurtidoAbarrotesPage]
})
export class SurtidoAbarrotesPageModule {}
