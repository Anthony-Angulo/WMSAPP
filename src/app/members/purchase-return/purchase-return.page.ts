import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SettingsService } from './../../services/settings.service';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-purchase-return',
  templateUrl: './purchase-return.page.html',
  styleUrls: ['./purchase-return.page.scss'],
})
export class PurchaseReturnPage implements OnInit {

  load: any;
  data: any
  apiSAP: any
  number: number;
  entries: any;

  constructor(
  private http: HttpClient,
  private settings: SettingsService,
  private navExtras: NavExtrasService,
  private receptionService: RecepcionDataService,
  private toastController: ToastController,
  private router: Router,
  private loading: LoadingController,
  private platform: Platform,) { }

  ngOnInit() {

    if (this.platform.is("cordova")) {
      this.data = this.settings.fileData
      this.apiSAP = this.data.apiSAP
    } else {
      this.apiSAP = environment.apiSAP
    }


  }

  public async getOrden(){

    await this.presentLoading("Buscando Entradas...")

    this.http.get(this.apiSAP + '/api/purchaseorder/Receptions/' + this.number)
      .toPromise().then((resp) => {
        this.entries = resp
        console.log(this.entries)
      }).catch((err) => {
        console.log(err)
        this.presentToast("Error al buscar entradas.","warning")
      }).finally(() => { this.hideLoading() })
  }

  public getPurchaseDetail(index: number){

    this.navExtras.setEntry(this.entries.PurchaseDelivery[index])
    this.router.navigate(['members/purchase-return-detail'])
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      color: color,
      duration: 4000
    });
    toast.present();
  }

  async presentLoading(msg) {
    this.load = await this.loading.create({
      message: msg,
      // duration: 3000
    });

    await this.load.present()
  }

  hideLoading() {
    // console.log('loading')
    this.load.dismiss()
  }
}
