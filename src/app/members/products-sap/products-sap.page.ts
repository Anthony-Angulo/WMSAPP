import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SettingsService } from '../../services/settings.service';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { ToastController, LoadingController } from '@ionic/angular';
import { getSettingsFileData } from '../commons';

const TOKEN_KEY = 'auth-token';

@Component({
  selector: 'app-products-sap',
  templateUrl: './products-sap.page.html',
  styleUrls: ['./products-sap.page.scss'],
})
export class ProductsSapPage implements OnInit {

  public appSettings: any;

  load: any;
  number: any
  inventory: any
  sucursales: any
  sucursal: any
  productInfo
  data
  priceList = []
  apiSAP: string;
  CbAbarrote: any;
  CbCarne
  priceId
  searchType: any;
  uom: any;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private platform: Platform,
    private loading: LoadingController,
    private settings: SettingsService,
    private storage: Storage
  ) { }

  ngOnInit() {

    this.appSettings = getSettingsFileData(this.platform, this.settings);

  }


  async searchProductByCb() {

    if (this.CbAbarrote == '' || this.CbAbarrote == undefined) return

    
    await this.presentLoading('Buscando producto....');

      

      Promise.all([
        this.http.get(`${this.appSettings.apiSAP}/api/codebar/${this.CbAbarrote}`).toPromise(),
        this.http.get(`${this.appSettings.apiSAP}/api/pricelist/WmsProducts`).toPromise()
      ]).then(([product, priceList]: any) => {
        this.priceList = priceList.filter(y => y.ListNum == 26 || y.ListNum == 27 || y.ListNum == 11 || y.ListNum == 12 );
        return this.http.get(`${this.appSettings.apiSAP}/api/products/crmtosell/${product.Detail.ItemCode}/1/${this.appSettings.sucursal}`).toPromise()
      }).then((prod: any) => {
        this.inventory = prod
        this.uom = this.inventory.UOMList.find(x => x.UomEntry == this.inventory.UomEntry)
      }).catch(async error => {
        if (error.status == 401) {
          this.presentToast(error.error, "danger");
        } else {
          this.presentToast('Error al buscar producto', 'danger');
        }
      }).finally(() => {
        this.hideLoading()
      });

      this.CbAbarrote = '';
    
  }

  async searchProductByCbBeef() {

    if (this.CbCarne == '' || this.CbCarne == undefined) return

    await this.presentLoading('Buscando Producto....');

    let gtin = this.CbCarne.substr(3 - 1, 14)



    Promise.all([
      this.http.get(`${environment.apiWMS}/getProductByGTIN/${gtin}`).toPromise(),
      this.http.get(`${this.appSettings.apiSAP}/api/pricelist/WmsProducts`).toPromise()
    ]).then(([product, priceList]: any) => {
      this.priceList = priceList.filter(y => y.ListNum == 1 || y.ListNum == 13 || y.ListNum == 16 || y.ListNum == 15 || y.ListNum == 14);
      return this.http.get(`${this.appSettings.apiSAP}/api/products/crmtosell/${product.codigo_sap}/1/${this.appSettings.sucursal}`).toPromise()
    }).then((prod: any) => {
      this.inventory = prod
      this.uom = this.inventory.UOMList.find(x => x.UomEntry == this.inventory.UomEntry)
    }).catch(async error => {
      if (error.status == 401) {
        this.presentToast(error.error, "danger");
      } else {
        this.presentToast('Error al buscar producto', 'danger');
      }
    }).finally(() => {
      this.hideLoading()
    })


    this.CbAbarrote = '';
  }

  public updatePrice() {
    this.http.get(`${this.appSettings.apiSAP}/api/products/crmtosell/${this.inventory.ItemCode}/${this.priceId}/${this.appSettings.sucursal}`).toPromise()
      .then((prod: any) => {
        this.inventory = prod
        this.uom = this.inventory.UOMList.find(x => x.UomEntry == this.inventory.UomEntry)
      }).catch(err => {
        this.presentToast("Error al buscar precio", "warning")
      })
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

  public hideLoading() {
    this.load.dismiss()
  }

}
