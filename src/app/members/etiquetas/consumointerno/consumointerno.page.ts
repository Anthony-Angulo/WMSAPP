import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../services/settings.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { getSettingsFileData } from '../../commons';
import { ConsumoInterno, PostConsumoInterno } from '../../../interfaces/ConsumoInterno';

const TOKEN_KEY = 'auth-token';

@Component({
  selector: 'app-consumointerno',
  templateUrl: './consumointerno.page.html',
  styleUrls: ['./consumointerno.page.scss'],
})
export class ConsumointernoPage implements OnInit {

  public appSettings: any; 

  productNumber: string;
  productDetail: any;
  caducidad: any;
  lote: string;
  peso: string;
  load: any;

  constructor(private http: HttpClient,
    private settings: SettingsService,
    private toastController: ToastController,
    private loading: LoadingController,
    private platform: Platform,
    private storage: Storage) { }

  ngOnInit() {
   this.appSettings = getSettingsFileData(this.platform, this.settings);
  }

  async getProducto() {

    if (this.productNumber == undefined) {
      this.presentToast('Debes ingresar codigo de producto', 'warning')
      return
    }

    let token = await this.storage.get(TOKEN_KEY);

    let headers = new HttpHeaders();

    headers = headers.set('Authorization', `Bearer ${token}`)

    await this.presentLoading('Buscando Producto..');

    this.http.get(`${this.appSettings.apiSAP}/api/Products/ConsumoInterno/${this.productNumber.toUpperCase()}`, {headers}).toPromise().then((consumoInterno: ConsumoInterno) => {
      if (consumoInterno.ItemName == null) {
        this.presentToast('Producto No Encontrado', 'warning');
      } else {
        this.productDetail = consumoInterno;
      }
    }).catch((err) => { 
      if(err.status == 401) {
        this.presentToast(err.error, "danger");
      } else {
        this.presentToast(err.error, "danger");
      }
      
    }).finally(() => { this.hideLoading() });
  }

  async printLabel() {

    await this.presentLoading('Imprimiendo..');

    var date = this.caducidad.split('T')[0];
    var datesplit = date.split('-').join('');
    datesplit = datesplit.substring(2);


    let post: PostConsumoInterno = {
      ItemCode: this.productDetail.ItemCode,
      ItemName: this.productDetail.ItemName,
      Batch: this.lote,
      ExpirationDate: datesplit,
      Count: (this.peso == undefined) ? '' : this.peso,
      IDPrinter: (this.appSettings.IpImpresora == undefined) ? 'S01-recepcion01' : this.appSettings.IpImpresora,
    };

    let token = await this.storage.get(TOKEN_KEY);

    let headers = new HttpHeaders();

    headers = headers.set('Authorization', `Bearer ${token}`)

    this.http.post(`${this.appSettings.apiSAP}/api/impresion/carnes`, post, {headers}).toPromise().catch(error => {
      this.presentToast('Error al imprimir etiquetas', 'danger')
    }).finally(() => {
      this.hideLoading()
      this.presentToast('Impresion Completado', 'success')
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
    });

    await this.load.present()
  }

  hideLoading() {
    this.load.dismiss()
  }

}
