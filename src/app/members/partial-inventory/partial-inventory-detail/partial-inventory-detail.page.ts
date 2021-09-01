import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NavExtrasService } from '../../../services/nav-extras.service';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { Platform } from '@ionic/angular';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';

const USER = 'user';

@Component({
  selector: 'app-partial-inventory-detail',
  templateUrl: './partial-inventory-detail.page.html',
  styleUrls: ['./partial-inventory-detail.page.scss'],
})
export class PartialInventoryDetailPage implements OnInit {

  products: any;
  load: any;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private platform: Platform,
    private navExtras: NavExtrasService,
    private alertController: AlertController,
    private loading: LoadingController,
    private storage: Storage
  ) { }

  async ngOnInit() {

    await this.presentLoading("Buscando productos...");

    let sapHeader = this.navExtras.getMovInv()

    let user = await this.storage.get(USER);

    this.http.get(`${environment.apiCCFN}/inventory/${sapHeader}/${user.id}`).toPromise().then((resp) => {
      this.products = resp;
    }).catch((err) => {
      this.presentToast(err.message, "danger");
    }).finally(() => { this.hideLoading() })
  }

  goToProduct(index: number) {
    this.products[index].headerId = this.navExtras.getMovInv();
    this.navExtras.setInventoryProduct(this.products[index])

    if (this.products[index].WeightType == "F") {
      this.router.navigate(['members/partial-abarrotes']);
    } else if (this.products[index].WeightType == "V") {
      this.router.navigate(['members/partial-beef']);
    } else {
      this.presentToast("El producto no tiene configurado tipo de peso. " +
        "Contactar datos maestros.", "warning")
    }
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
