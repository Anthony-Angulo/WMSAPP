import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { IonicModule } from '@ionic/angular';
import {Scangs1Component} from './scangs1.component'
const routes: Routes = [
  {
    path: '',
    component: Scangs1Component
  }
];

@NgModule({
  declarations: [Scangs1Component],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgxQRCodeModule,
    RouterModule.forChild(routes)
  ]
})
export class Scangs1Module { }
