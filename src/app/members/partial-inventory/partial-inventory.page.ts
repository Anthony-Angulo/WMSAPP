import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NavExtrasService } from '../../services/nav-extras.service';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-partial-inventory',
  templateUrl: './partial-inventory.page.html',
  styleUrls: ['./partial-inventory.page.scss'],
})
export class PartialInventoryPage implements OnInit {

  inventory_orders: Object;
  load: any;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,
    private navExtras: NavExtrasService,
  ) { }

  async ngOnInit() {

  await this.presentLoading("Buscando Inventarios...")

    this.http.get(`${environment.apiCCFN}/inventory/partial`).toPromise().then((resp) => {
      this.inventory_orders = resp
      console.log(resp)
    }).catch((err => {
      console.log(err)
    })).finally(() => { this.hideLoading() })
  }

  goToInventory(index: number){
    this.navExtras.setMovInv(this.inventory_orders[index].ID)
    this.router.navigate(['/members/partial-inventory-detail'])
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
