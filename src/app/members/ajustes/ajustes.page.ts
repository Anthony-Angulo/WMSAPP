import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService } from './../../services/settings.service';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.page.html',
  styleUrls: ['./ajustes.page.scss'],
})
export class AjustesPage implements OnInit {

  data
  apiSAP
  porcentaje
  blob: Blob

  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController,
    private router: Router,
    private settings: SettingsService
  ) { }

  ngOnInit() {
    this.data = this.settings.fileData
    this.apiSAP = this.data.apiSAP
    this.porcentaje = this.data.porcentaje
  }

  async guardarAjustes() {
    if (this.apiSAP == '' || this.apiSAP == undefined) {
      this.presentToast('Debes ingresar una direccion', 'warning')
    } else if (this.porcentaje == '' || this.porcentaje == undefined) {
      this.presentToast('Debes ingresar un porcentaje', 'warning')
    } else {
      this.settings.saveFile(this.apiSAP, this.porcentaje)
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
