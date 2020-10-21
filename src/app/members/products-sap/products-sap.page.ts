import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { SettingsService } from '../../services/settings.service';
import { Platform } from '@ionic/angular';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-products-sap',
  templateUrl: './products-sap.page.html',
  styleUrls: ['./products-sap.page.scss'],
})
export class ProductsSapPage implements OnInit {

  load: any;
  number: any
  inventory: any
  sucursales: any
  sucursal: any
  productInfo
  data
  priceList = []
  apiSAP: string;
  CbAbarrote
  CbCarne
  priceId
  searchType: any;
  uom: any;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private platform: Platform,
    private loading: LoadingController,
    private settings: SettingsService
  ) { }

  ngOnInit() {

    if (this.platform.is("cordova")) {
      this.data = this.settings.fileData
      this.sucursal = this.data.sucursal
      this.apiSAP = this.data.apiSAP
    } else {
      this.apiSAP = environment.apiSAP
      this.sucursal = "S01"
    }
  }

  // async getProducto(){
  //
  //   await this.presentLoading('Buscando...')
  //
  //   return Promise.all([
  //     this.http.get(environment.apiSAP + '/api/products/crm/' + this.number.toUpperCase()).toPromise(),
  //     this.http.get(environment.apiSAP + '/api/warehouse').toPromise(),
  //   ]).then(([resp, sucursales]: any []) => {
  //     this.inventory = resp
  //     this.sucursales = sucursales
  //
  //     this.inventory.stock.map(product => {
  //       product.WhsName = this.sucursales.find(x => x.WhsCode == product.WhsCode).WhsName
  //       product.PuM = Number(product.OnHand / Number(this.inventory.uom.find(x => x.UomEntry == '14').BaseQty))
  //     })
  //
  //     console.log(this.inventory)
  //   }).catch((error) => {
  //     this.presentToast(error.error.error,'danger')
  //   }).finally(() => {
  //     this.hideLoading()
  //   })
  //
  // }

  async searchProductByCb() {

    if (this.CbAbarrote == '' || this.CbAbarrote == undefined) {

    } else {

      await this.presentLoading('Buscando....')

      return Promise.all([
        this.http.get(this.apiSAP + '/api/codebar/' + this.CbAbarrote).toPromise(),
        this.http.get(this.apiSAP + '/api/pricelist').toPromise()
      ]).then(([product, priceList] : any) =>{
        this.http.get(this.apiSAP + '/api/products/crmtosell/' +
        product.Detail.ItemCode + '/' + 1 + '/' + this.sucursal).toPromise()
        .then((prod: any) => {
          this.inventory = prod
          this.uom = this.inventory.UOMList.find(x => x.UomEntry == this.inventory.UomEntry)
        })
        this.priceList = priceList.filter(y => y.ListNum == 1 || y.ListNum == 13
          || y.ListNum == 16 || y.ListNum == 15 || y.ListNum == 14)
      }).catch((error) => {
        this.presentToast('Error al buscar producto', 'danger')
        console.log(error)
      }).finally(() => {
        this.hideLoading()
      })

    }


    this.CbAbarrote = ''
  }

  async searchProductByCbBeef() {

    if (this.CbCarne == '' || this.CbCarne == undefined) {

    } else {

      await this.presentLoading('Buscando....')
      let gtin = this.CbCarne.substr(3- 1, 14)
      return Promise.all([
        this.http.get(environment.apiWMS + '/getProductByGTIN/' + gtin).toPromise(),
        this.http.get(this.apiSAP + '/api/pricelist').toPromise()
      ]).then(([product, priceList] : any) =>{
        this.http.get(this.apiSAP + '/api/products/crmtosell/' +
        product.codigo_sap + '/' + 1 + '/' + this.sucursal).toPromise()
        .then((prod: any) => {
          this.inventory = prod
          this.uom = this.inventory.UOMList.find(x => x.UomEntry == this.inventory.UomEntry)
        })
        this.priceList = priceList.filter(y => y.ListNum == 1 || y.ListNum == 13
          || y.ListNum == 16 || y.ListNum == 15 || y.ListNum == 14)
      }).catch((error) => {
        this.presentToast('Error al buscar producto', 'danger')
        console.log(error)
      }).finally(() => {
        this.hideLoading()
      })
    }
    this.CbAbarrote = ''
  }

  // selectSucursal(){
  //   console.log(this.sucursal)
  //   this.productInfo = this.inventory.stock.filter(x => x.WhsCode == this.sucursal)
  //   this.productInfo.stocks = []
  //   this.inventory.UOMList.forEach(uom => {
  //     this.productInfo.stocks.push({
  //       Uom: uom.UomCode,
  //       quantity: Number(this.productInfo[0].StockValue / uom.BaseQty )
  //     })
  //   })
  //   console.log(this.productInfo)
  // }

  updatePrice(){
    this.http.get(this.apiSAP + '/api/products/crmtosell/' +
    this.inventory.ItemCode + '/' + this.priceId + '/' + this.sucursal).toPromise()
    .then((prod: any) => {
      this.inventory = prod
      this.uom = this.inventory.UOMList.find(x => x.UomEntry == this.inventory.UomEntry)
    }).catch(err => {
      this.presentToast("Error al buscar precio","warning")
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
      // duration: 3000
    });

    await this.load.present()
  }

  hideLoading() {
    // console.log('loading')
    this.load.dismiss()
  }

}
