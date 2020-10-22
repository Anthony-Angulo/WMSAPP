import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../services/settings.service';
import { environment } from 'src/environments/environment';
import { ToastController, LoadingController } from '@ionic/angular';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-consumointerno',
  templateUrl: './consumointerno.page.html',
  styleUrls: ['./consumointerno.page.scss'],
})
export class ConsumointernoPage implements OnInit {

  datos: any;
  apiSAP: string;
  IpImpresora: string;
  productNumber: string;
  load: any;
  productDetail: any;
  caducidad: any;
  lote: any;
  peso: string;

  constructor(private http: HttpClient,
    private settings: SettingsService,
    private toastController: ToastController,
    private loading: LoadingController,
    private platform: Platform) { }

  ngOnInit() {
    if (this.platform.is("cordova")) {
      this.datos = this.settings.fileData
      this.apiSAP = this.datos.apiSAP
      this.IpImpresora = this.datos.IpImpresora;
    } else {
      this.apiSAP = environment.apiSAP
    }
  }

  async getProducto() {

    if (this.productNumber == undefined) {
      this.presentToast('Debes ingresar codigo de producto', 'warning')
      return
    }

    await this.presentLoading('Buscando Producto..');

    this.http.get(this.apiSAP + '/api/products/detail/' + this.productNumber.toUpperCase()).toPromise().then((val) => {
      if (val) {
        this.productDetail = val;
      } else {
        this.presentToast('Producto No Encontrado', 'warning');
      }
    }).catch((err) => { console.log(err) }).finally(() => { this.hideLoading() });
  }

  async printLabel() {

    await this.presentLoading('Imprimiendo..');

    var date = this.caducidad.split('T')[0];
    var datesplit = date.split('-').join('');
    datesplit = datesplit.substring(2);

    var options = {
      ItemCode: this.productDetail.Detail.ItemCode,
      ItemName: this.productDetail.Detail.ItemName,
      Batch: this.lote,
      ExpirationDate: datesplit,
      Count: (this.peso == undefined) ? '' : this.peso,
      IDPrinter: (this.IpImpresora == undefined) ? 'S01-recepcion01' : this.IpImpresora,
    }

    this.http.post(this.apiSAP + '/api/impresion/carnes', options).toPromise().catch(error => {
      this.presentToast('Error al imprimir etiquetas', 'danger')
    }).finally(() => {
      this.hideLoading()
      // this.presentToast('Impresion Completado', 'success')
    });
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
