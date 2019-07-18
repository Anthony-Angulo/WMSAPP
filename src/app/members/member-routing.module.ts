
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'profile', loadChildren: './profile/profile.module#ProfilePageModule' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'recepcion', loadChildren: './recepcion/recepcion.module#RecepcionPageModule' },
  { path: 'scannproducts', loadChildren: './scannproducts/scannproducts.module#ScannproductsPageModule' },
  { path: 'delivery', loadChildren: './delivery/delivery.module#DeliveryPageModule' },  { path: 'tarimas', loadChildren: './tarimas/tarimas.module#TarimasPageModule' },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MemberRoutingModule { }
