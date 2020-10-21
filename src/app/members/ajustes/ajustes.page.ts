import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from './../../services/settings.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.page.html',
  styleUrls: ['./ajustes.page.scss'],
})
export class AjustesPage implements OnInit {

  data: any;
  apiSAP: string;
  porcentaje: string;
  sucursal: string;
  IP: string;
  blob: Blob
  impresoras: any;
  load: any;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private loading: LoadingController,
    private settings: SettingsService,
    private platform: Platform
  ) { }

  async ngOnInit() {

    if (this.platform.is("cordova")) {
      this.data = this.settings.fileData
      this.apiSAP = this.data.apiSAP
      this.porcentaje = this.data.porcentaje
      this.sucursal = this.data.sucursal
    } else {
      this.apiSAP = environment.apiSAP
    }


    await this.presentLoading("Buscando Impresoras..")

    this.http.get(this.apiSAP + '/api/impresion/impresoras').toPromise().then((resp: any) => {
      this.impresoras = resp
    }).catch(err => {
      console.log(err)
    }).finally(() => {
      this.hideLoading()
    })
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
      // duration: 3000
    });

    await this.load.present()
  }

  hideLoading() {
    // console.log('loading')
    this.load.dismiss()
  }

}
