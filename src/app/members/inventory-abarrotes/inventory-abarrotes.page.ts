import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-inventory-abarrotes',
  templateUrl: './inventory-abarrotes.page.html',
  styleUrls: ['./inventory-abarrotes.page.scss'],
})
export class InventoryAbarrotesPage implements OnInit {

  //product data
  productData: any;

  //inputs binding
  codigoBarra: any = '';
  cantidad: number;
  eventCodeBar: any;
  lote: any = 0

  //toggle binding
  modo: any;


  //variables global
  boxExist: boolean;
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

    if (this.productData.Barcode == null) {
      this.boxExist = false
    } else {
      this.boxExist = true
    }
    this.navExtras.setInventoryProduct(null)
  }

  addProduct() {
    if (this.cantidad != 0 && this.cantidad != undefined) {
      this.productData.cantidad_contada = this.cantidad
      this.productData.cantidad_diferencia = this.cantidad - this.productData.cantidad_teorica
      this.productData.lote = this.lote
      this.router.navigate(['/members/inventory-order-detail'])
    } else {
      this.presentToast('Ingresa primero una cantidad y/o lote.', 'warning')
    }

    this.lote = ''
  }

  addOnChange(event) {
    if (event.target.value == this.productData.Barcode) {
      if (this.productData.cantidad_contada != 0) {
        this.productData.cantidad_contada = Number(this.productData.cantidad_contada) + 1
        this.productData.cantidad_diferencia = this.productData.cantidad_contada - this.productData.cantidad_teorica
        this.productData.lote = this.lote
      } else {
        this.productData.cantidad_contada = 1
        this.productData.cantidad_diferencia = this.productData.cantidad_contada - this.productData.cantidad_teorica
        this.productData.lote = this.lote
      }
      this.inventarirarProducts()
    } else {
      this.presentToast('El codigo no coincide. Intenta de nuevo', 'warning')
    }
  }

  inventarirarProducts() {
    this.navExtras.setScannedProducts(this.productData)
    this.router.navigate(['/members/inventory-order-detail'])
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      position: "bottom",
      color: color,
      duration: 2000
    });
    toast.present();
  }

  async presentLoading(msg: string) {
    this.load = await this.loading.create({
      message: msg,
      duration: 3000
    });

    await this.load.present()
  }
}
