import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { getCerosFromEtiqueta } from '../../commons';

@Component({
  selector: 'app-abarrotes',
  templateUrl: './abarrotes.page.html',
  styleUrls: ['./abarrotes.page.scss'],
})
export class AbarrotesPage implements OnInit {

  productData: any;
  cantidad: number;
  load: any;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private NavExtras: NavExtrasService,
    private router: Router,
    private alert: AlertController,
    private loading: LoadingController
  ) { }

  ngOnInit() {
    this.productData = this.NavExtras.getProducts();
  }

  public acceptReturn() {
    if (this.productData.count != 0 && this.cantidad == 0) {
      this.productData.count = this.cantidad
      this.NavExtras.setScannedProducts(this.productData)
      this.router.navigate(['/members/purchase-return-detail'])
      return
    } else if (this.cantidad <= 0) {
      this.presentToast('Debe igresar una cantidad valida', 'warning')
      return
    } else {
      this.productData.count = this.cantidad
      this.NavExtras.setScannedProducts(this.productData)
      this.router.navigate(['/members/purchase-return-detail'])
    }
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      position: "middle",
      color: color,
      duration: 4000
    });
    toast.present();
  }

  async presentLoading(msg) {
    this.load = await this.loading.create({
      message: msg,
    });

    await this.load.present()
  }

  hideLoading() {
    this.load.dismiss()
  }

}
