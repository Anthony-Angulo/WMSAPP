import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-inventory-beef',
  templateUrl: './inventory-beef.page.html',
  styleUrls: ['./inventory-beef.page.scss'],
})
export class InventoryBeefPage implements OnInit {

  //product data
  productData: any;
  codigoBarra: any;
  lote: any;
  load;

  constructor(
    private http: HttpClient,
    private barcodeScanner: BarcodeScanner,
    private navExtras: NavExtrasService,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,
    private storage: Storage
  ) { }

  ngOnInit() {
    this.productData = this.navExtras.getInventoryProduct()

    if (!this.productData.detalle) this.productData.detalle = []

    console.log(this.productData)
  }

  addOnChange(event) {

    if (event.target.value == '') {

    } else {
      this.codigoBarra = event.target.value
      this.productData.cantidad_contada = Number(this.productData.cantidad_contada) + 1
      this.productData.cantidad_diferencia = this.productData.cantidad_contada - this.productData.cantidad_teorica
      this.productData.lote = this.lote

      this.productData.detalle.push({
        MovimientoInventarioDetalle_id: this.productData.MovimientoInventario_id,
        producto_id: this.productData.producto_id,
        codigo_protehus: this.productData.codigo_prothevs,
        codigodebarras: this.codigoBarra,
        lote_id: this.lote
      })
    }
    this.codigoBarra = ''

  }

  inventarirarProducts() {
    this.navExtras.setScannedProducts(this.productData)
    this.router.navigate(['/members/inventory-order-detail'])
  }

}
