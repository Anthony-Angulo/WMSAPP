import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { NavExtrasService } from 'src/app/services/nav-extras.service';

@Component({
  selector: 'app-scannproducts',
  templateUrl: './scannproducts.page.html',
  styleUrls: ['./scannproducts.page.scss'],
})

export class ScannproductsPage implements OnInit {

  data: any;
  scannedProduct: any;
  cantidad: number = 0;
  productCode: any;
  band: boolean = true;
  KGcarne: number = 0;
  codigoCarne: any;
  beefScanned: any = [];
  total: number = 0;

  constructor(
    private navExtras: NavExtrasService,
    private toastController: ToastController,
    private router: Router) { }

  ngOnInit() {
    this.data = this.navExtras.getExtras();
    let id = this.navExtras.getScannedProducts()
    let id2 = this.navExtras.getScannedBeef();

    if (id != null) {
      let product_index = this.data.products.findIndex((product: any) => product.codbarSB == id || product.codbarSB == id2);
      this.scannedProduct = this.data.products[product_index]
      this.productCode = this.scannedProduct.codbarSB;
      this.cantidad = this.scannedProduct.count
    }
    if (this.scannedProduct.peso == "V") {
      this.band = false;
    }
    this.navExtras.setScannedProducts(null)
  }

  public scannProduct(val: any) {
    let valor = val.target.value;
    if (valor != '') {
      let product_index = this.data.products.findIndex((product: any) => product.codbarSB == valor);
      if (product_index >= 0) {
        this.scannedProduct = this.data.products[product_index]
      } else {
        let product_index = this.data.products.findIndex((product: any) => product.codbarLK == valor);
        if (product_index >= 0) {
          this.scannedProduct = this.data.products[product_index]
        } else {
          this.presentToast('El codigo de producto no existe en la orden.');
        }
      }
    }
  }

  public receptionProducts() {

    if (!this.band) {
      const data = {
        codigo_prot: this.productCode,
        total: this.total
      }
      this.navExtras.setScannedCodeAndTotal(data);
      this.navExtras.setScannedBeef(this.beefScanned);
    } else {
      if (this.scannedProduct == null) {

      } else {
        const scanned = {
          codigo: this.scannedProduct.codigo_prothevs,
          cantidad: this.cantidad,
        }
        console.log(scanned)
        this.navExtras.setScannedProducts(scanned);
      }
    }

    this.router.navigate(['/members/recepcion']);

  }

  public registrarCarnes() {

    this.total = this.KGcarne + this.total;

    const scanned = {
      orden_compra: this.data.orderData.orden_compra,
      codigo_protehus: this.productCode,
      cantidad: this.KGcarne,
      codigobarras: this.codigoCarne
    }

    this.beefScanned.push(scanned);
    this.codigoCarne = '';
    this.KGcarne = 0;
  }

  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }
}
