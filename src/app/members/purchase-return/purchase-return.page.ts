import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SettingsService } from './../../services/settings.service';
import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { ToastController, LoadingController } from '@ionic/angular';
import { getSettingsFileData } from '../commons';



@Component({
  selector: 'app-purchase-return',
  templateUrl: './purchase-return.page.html',
  styleUrls: ['./purchase-return.page.scss'],
})
export class PurchaseReturnPage implements OnInit {

  public appSettings: any;

  load: any;
  data: any
  apiSAP: any
  number: number;
  entries: any;

  constructor(
    private http: HttpClient,
    private settings: SettingsService,
    private navExtras: NavExtrasService,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,
    private platform: Platform,
    private storage: Storage) { }

  ngOnInit() {

    this.appSettings = getSettingsFileData(this.platform, this.settings);

  }

  public async getOrden() {

    await this.presentLoading("Buscando Entradas...");


      this.http.get(`${this.appSettings.apiSAP}/api/purchaseorder/Receptions/${this.number}`).toPromise().then((resp) => {
        this.entries = resp
        console.log(this.entries)
      }).catch((err) => {
        console.log(err)
        this.presentToast("Error al buscar entradas.", "warning")
      }).finally(() => { this.hideLoading() });


  }

  public getPurchaseDetail(index: number) {
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
    });

    await this.load.present()
  }

  hideLoading() {
    this.load.dismiss()
  }
}
