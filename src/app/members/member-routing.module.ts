
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';

const routes: Routes = [
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
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
  { path: 'full-inventory', loadChildren: './full-inventory/full-inventory.module#FullInventoryPageModule' },
  { path: 'full-abarrotes', loadChildren: './full-inventory/abarrotes/abarrotes.module#AbarrotesPageModule' },
  { path: 'full-beef', loadChildren: './full-inventory/beef/beef.module#BeefPageModule' },
  { path: 'partial-inventory', loadChildren: './partial-inventory/partial-inventory.module#PartialInventoryPageModule' },
  { path: 'partial-inventory-detail', loadChildren: './partial-inventory/partial-inventory-detail/partial-inventory-detail.module#PartialInventoryDetailPageModule' },
  { path: 'partial-abarrotes', loadChildren: './partial-inventory/abarrotes/abarrotes.module#AbarrotesPageModule' },
  { path: 'partial-beef', loadChildren: './partial-inventory/beef/beef.module#BeefPageModule' },
  { path: 'pedimento', loadChildren: './recepcion-sap/pedimento/pedimento.module#PedimentoPageModule' },
  { path: 'etiquetas-transferencias', loadChildren: './etiquetas-transferencias/etiquetas-transferencias.module#EtiquetasTransferenciasPageModule' },
  { path: 'ajustes', loadChildren: './ajustes/ajustes.module#AjustesPageModule' },
  { path: 'scann-inventory',  canActivate: [AuthGuard], loadChildren: './scann-inventory/scann-inventory.module#ScannInventoryPageModule' },
  { path: 'products-sap',  canActivate: [AuthGuard], loadChildren: './products-sap/products-sap.module#ProductsSapPageModule' },
  { path: 'scann-cajas', loadChildren: './scann-cajas/scann-cajas.module#ScannCajasPageModule' },
  { path: 'purchase-return', loadChildren: './purchase-return/purchase-return.module#PurchaseReturnPageModule' },
  { path: 'purchase-return-detail', loadChildren: './purchase-return/purchase-return-detail/purchase-return-detail.module#PurchaseReturnDetailPageModule' },
  { path: 'purchase-return-abarrotes', loadChildren: './purchase-return/abarrotes/abarrotes.module#AbarrotesPageModule' },
  { path: 'purchase-return-abarrotes-batch', loadChildren: './purchase-return/abarrotes-batch/abarrotes-batch.module#AbarrotesBatchPageModule' },
  { path: 'purchase-return-beef', loadChildren: './purchase-return/beef/beef.module#BeefPageModule' },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MemberRoutingModule { }
