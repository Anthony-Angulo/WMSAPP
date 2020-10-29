import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SettingsService } from './../../services/settings.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { getSettingsFileData } from '../commons';

const TOKEN_KEY = 'auth-token';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.page.html',
  styleUrls: ['./ajustes.page.scss'],
})

export class AjustesPage implements OnInit {

  public data: any;
  public apiSAP: string;
  public porcentaje: string;
  public sucursal: string;
  public IP: string;
  public impresoras: any;
  public load: any;
  public appSettings: any;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private loading: LoadingController,
    private settings: SettingsService,
    private platform: Platform,
    private storage: Storage
  ) { }

  async ngOnInit() {

    this.appSettings = getSettingsFileData(this.platform, this.settings);

    this.apiSAP = this.appSettings.apiSAP;
    this.porcentaje = this.appSettings.porcentaje;
    this.sucursal = this.appSettings.sucursal;
    
    await this.presentLoading("Buscando Impresoras..")

    let token = await this.storage.get(TOKEN_KEY);

    let headers = new HttpHeaders();

    headers = headers.set('Authorization', `Bearer ${token}`)

    this.http.get(`${this.appSettings.apiSAP}/api/impresion/impresoras`, {headers}).toPromise().then((resp: any) => {
      this.impresoras = resp
    }).catch(err => {
      if(err.status == 401) {
        this.presentToast("No Autorizado","danger");
      } else {
        this.presentToast(err.error, "danger");
      }
    }).finally(() => {
      this.hideLoading()
    });
  }

  async guardarAjustes() {
    if (this.apiSAP == '' || this.apiSAP == undefined) {
      this.presentToast('Debes ingresar una direccion', 'warning')
    } else if (this.porcentaje == '' || this.porcentaje == undefined) {
      this.presentToast('Debes ingresar un porcentaje', 'warning')
    } else if (this.sucursal == '' || this.sucursal == undefined) {
      this.presentToast('Debes ingresar una sucursal', 'warning')
    } else {
      this.settings.saveFile(this.apiSAP, this.porcentaje, this.sucursal, this.IP)
    }
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
