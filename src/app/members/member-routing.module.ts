
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';

const routes: Routes = [
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'recepcion', loadChildren: './recepcion/recepcion.module#RecepcionPageModule' },
  { path: 'scannproducts', loadChildren: './scannproducts/scannproducts.module#ScannproductsPageModule' },
  { path: 'delivery', loadChildren: './delivery/delivery.module#DeliveryPageModule' },
  { path: 'tarimas', loadChildren: './tarimas/tarimas.module#TarimasPageModule' },
  { path: 'ubicar', loadChildren: './ubicar/ubicar.module#UbicarPageModule' },
  { path: 'tarimas-modal', loadChildren: './tarimas-modal/tarimas-modal.module#TarimasModalPageModule' },
  { path: 'recepcion-beef', loadChildren: './recepcion-beef/recepcion-beef.module#RecepcionBeefPageModule' },
  { path: 'scann-cajas', loadChildren: './scann-cajas/scann-cajas.module#ScannCajasPageModule' },
  { path: 'inventario-ciclico', loadChildren: './inventario-ciclico/inventario-ciclico.module#InventarioCiclicoPageModule' },
  { path: 'inventory-order-detail', loadChildren: './inventory-order-detail/inventory-order-detail.module#InventoryOrderDetailPageModule' },
  { path: 'inventory-abarrotes', loadChildren: './inventory-abarrotes/inventory-abarrotes.module#InventoryAbarrotesPageModule' },
  { path: 'inventory-beef', loadChildren: './inventory-beef/inventory-beef.module#InventoryBeefPageModule' },
  { path: 'full-inventory', loadChildren: './full-inventory/full-inventory.module#FullInventoryPageModule' },
  { path: 'full-inventory-orders', loadChildren: './full-inventory-orders/full-inventory-orders.module#FullInventoryOrdersPageModule' },
  { path: 'ubicaciones', loadChildren: './ubicaciones/ubicaciones.module#UbicacionesPageModule' },
  // { path: 'surtido', loadChildren: './surtido/surtido.module#SurtidoPageModule' },
  // { path: 'surtido-abarrotes', loadChildren: './surtido-abarrotes/surtido-abarrotes.module#SurtidoAbarrotesPageModule' },
  // { path: 'surtido-beef', loadChildren: './surtido-beef/surtido-beef.module#SurtidoBeefPageModule' },
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
  { path: 'generate-etiqueta',  canActivate: [AuthGuard], loadChildren: './generate-etiqueta/generate-etiqueta.module#GenerateEtiquetaPageModule' },
  { path: 'scann-inventory',  canActivate: [AuthGuard], loadChildren: './scann-inventory/scann-inventory.module#ScannInventoryPageModule' },
  { path: 'products-sap',  canActivate: [AuthGuard], loadChildren: './products-sap/products-sap.module#ProductsSapPageModule' },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MemberRoutingModule { }
