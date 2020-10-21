import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DeliveryPage } from './delivery.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/members/delivery/billing',
    pathMatch: 'full'
  },
  {
    path: '',
    component: DeliveryPage,
    children: [
      {
        path: 'billing',
        loadChildren: './billing/billing.module#BillingPageModule'
      },
      {
        path: 'supply',
        loadChildren: './supply/supply.module#SupplyPageModule'
      },
      {
        path: 'signature',
        loadChildren: './signature/signature.module#SignaturePageModule'
      }
    ]
  }
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [DeliveryPage]
})
export class DeliveryPageModule {}
