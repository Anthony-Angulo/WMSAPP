import { Component, OnInit } from '@angular/core';
import { SettingsService } from './../../services/settings.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.page.html',
  styleUrls: ['./ajustes.page.scss'],
})
export class AjustesPage implements OnInit {

  data
  apiSAP
  porcentaje
  sucursal
  blob: Blob

  constructor(
    private toastController: ToastController,
    private settings: SettingsService
  ) { }

  ngOnInit() {
    this.data = this.settings.fileData
    this.apiSAP = this.data.apiSAP
    this.porcentaje = this.data.porcentaje
    this.sucursal = this.data.sucursal
  }

  async guardarAjustes() {
    if (this.apiSAP == '' || this.apiSAP == undefined) {
      this.presentToast('Debes ingresar una direccion', 'warning')
    } else if (this.porcentaje == '' || this.porcentaje == undefined) {
      this.presentToast('Debes ingresar un porcentaje', 'warning')
    } else if(this.sucursal == '' || this.sucursal == undefined){
      this.presentToast('Debes ingresar una sucursal', 'warning')
    } else {
      this.settings.saveFile(this.apiSAP, this.porcentaje, this.sucursal)
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

}
