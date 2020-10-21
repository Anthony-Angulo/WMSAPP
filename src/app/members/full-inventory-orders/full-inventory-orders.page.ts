import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';

const SUCURSAL_KEY = '0';
const USER_ID = '1';

@Component({
  selector: 'app-full-inventory-orders',
  templateUrl: './full-inventory-orders.page.html',
  styleUrls: ['./full-inventory-orders.page.scss'],
})
export class FullInventoryOrdersPage implements OnInit {

  inventory_orders: any = [];
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
    this.getInventoryOrders()
  }

  getInventoryOrders() {

    this.presentLoading('Buscando..')

    this.storage.get(SUCURSAL_KEY).then((sucursal_id: any) => {
      this.http.get(environment.apiWMS + '/getFullInventoryOrder/' + sucursal_id)
        .toPromise().then((inventory_orders: any) => {
          this.inventory_orders = inventory_orders
          console.log(this.inventory_orders)
        }).catch((error) => {
          console.log(error)
          this.presentToast('Error al obtener ordenes.', 'danger')
        }).finally(() => {
          this.hideLoading()
        })
    })
  }

  goToOrderDetail(index) {
    console.log(this.inventory_orders[index])
    this.navExtras.setMovInv(this.inventory_orders[index].id)
    this.router.navigate(['/members/full-inventory'])
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
