
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';

const routes: Routes = [
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'scann-cajas', loadChildren: './scann-cajas/scann-cajas.module#ScannCajasPageModule' },
  { path: 'recepcion-sap', canActivate: [AuthGuard],loadChildren: './recepcion-sap/recepcion-sap.module#RecepcionSapPageModule' },
  { path: 'abarrotes',  canActivate: [AuthGuard], loadChildren: './recepcion-sap/abarrotes/abarrotes.module#AbarrotesPageModule' },
  { path: 'abarrotes-batch',  canActivate: [AuthGuard], loadChildren: './recepcion-sap/abarrotes-batch/abarrotes-batch.module#AbarrotesBatchPageModule' },
  { path: 'beef',  canActivate: [AuthGuard], loadChildren: './recepcion-sap/beef/beef.module#BeefPageModule' },
  { path: 'transferencia-sap',  canActivate: [AuthGuard], loadChildren: './transferencia-sap/transferencia-sap.module#TransferenciaSapPageModule' },
  { path: 'transferencia-abarrotes',  canActivate: [AuthGuard], loadChildren: './transferencia-sap/abarrotes/abarrotes.module#AbarrotesPageModule' },
  { path: 'transferencia-abarrotes-batch',   canActivate: [AuthGuard], loadChildren: './transferencia-sap/abarrotes-batch/abarrotes-batch.module#AbarrotesBatchPageModule' },
  { path: 'transferencia-beef',  canActivate: [AuthGuard], loadChildren: './transferencia-sap/beef/beef.module#BeefPageModule' },
  { path: 'surtido-sap',  canActivate: [AuthGuard], loadChildren: './surtido-sap/surtido-sap.module#SurtidoSapPageModule' },
  { path: 'surtido-abarrotes',  canActivate: [AuthGuard], loadChildren: './surtido-sap/abarrotes/abarrotes.module#AbarrotesPageModule' },
  { path: 'surtido-abarrotes-batch',  canActivate: [AuthGuard], loadChildren: './surtido-sap/abarrotes-batch/abarrotes-batch.module#AbarrotesBatchPageModule' },
  { path: 'surtido-beef',  canActivate: [AuthGuard], loadChildren: './surtido-sap/beef/beef.module#BeefPageModule' },
  { path: 'scann-inventory',  canActivate: [AuthGuard], loadChildren: './scann-inventory/scann-inventory.module#ScannInventoryPageModule' },
  { path: 'products-sap',  canActivate: [AuthGuard], loadChildren: './products-sap/products-sap.module#ProductsSapPageModule' },
  { path: 'etiquetas-transferencias', loadChildren: './etiquetas-transferencias/etiquetas-transferencias.module#EtiquetasTransferenciasPageModule' },
  { path: 'ajustes', loadChildren: './ajustes/ajustes.module#AjustesPageModule' },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MemberRoutingModule { }
