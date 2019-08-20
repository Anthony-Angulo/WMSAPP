import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-inventory-order-detail',
  templateUrl: './inventory-order-detail.page.html',
  styleUrls: ['./inventory-order-detail.page.scss'],
})
export class InventoryOrderDetailPage implements OnInit {

  inventoryDetail = [];
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
    this.inventoryDetail = this.navExtras.getInventoryDetail()
    console.log(this.inventoryDetail)
  }

  ionViewWillEnter() {

    let inventoryproducts = this.navExtras.getScannedProducts();

    console.log(inventoryproducts)

    if (inventoryproducts != null) {
      let index = this.inventoryDetail.findIndex(product => { return product.id == inventoryproducts.id })

      if (index >= 0) {
        this.inventoryDetail[index] = inventoryproducts;
      }
    }
    this.navExtras.setScannedProducts(null);

  }

  ngOnDestroy() {
    this.navExtras.setInventoryDetail(null)
  }

  goToProduct(index: number) {
    this.navExtras.setInventoryProduct(this.inventoryDetail[index])

    if (this.inventoryDetail[index].product_type_id == 3) {
      this.router.navigate(['members/inventory-beef'])
    } else {
      this.router.navigate(['members/inventory-abarrotes'])
    }

    console.log(this.inventoryDetail[index])
  }

  sendProducts() {

    this.presentLoading('Guardando..')

    let invCompletas = []

    this.inventoryDetail.forEach(element => {

      if (element.cantidad_contada != 0) {
        invCompletas.push({
          id: element.id,
          cantidad_contada: element.cantidad_contada,
          cantidad_diferencia: element.cantidad_diferencia
        })
      }

    })

    this.http.post(environment.apiWMS + '/updateInventoryDetail', invCompletas).toPromise().then((data: any) => {
      this.hideLoading()
      this.presentToast('Se guardo correctamente.', 'success')
      this.router.navigate(['/members/inventario-ciclico'])
    }).catch(() => {
      this.presentToast('Error al guardar. Intenta nuevamente.', 'danger')
    }).finally(() => {
      this.hideLoading()
    })
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

  hideLoading() {
    this.load.dismiss()
  }

}
