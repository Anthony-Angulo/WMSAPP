import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../services/settings.service';
import { environment } from 'src/environments/environment';
import { ToastController, LoadingController } from '@ionic/angular';
import { Platform } from '@ionic/angular';


@Component({
  selector: 'app-locationlabels',
  templateUrl: './locationlabels.page.html',
  styleUrls: ['./locationlabels.page.scss'],
})
export class LocationlabelsPage implements OnInit {

  datos: any;
  apiSAP: string;
  IpImpresora: string;
  load: any;
  searchType: any;
  cuarto: string;
  zona: string;
  pasillo: string;
  rack: string;
  seccion: string;
  nivel: string;
  posicion: string;

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

  async printLabel() {
    var options = {
      room: this.cuarto,
      zone: this.zona,
      pasillo: this.pasillo,
      rack: this.rack,
      section: (this.seccion == undefined) ? '' : this.seccion,
      nivel: (this.nivel == undefined) ? '' : this.nivel,
      posicion: (this.posicion == undefined) ? '' : this.posicion,
      IDPrinter: (this.IpImpresora == undefined) ? 'S01-recepcion01' : this.IpImpresora,
    }

    if (this.seccion == undefined || this.nivel == undefined || this.posicion == undefined) {
      this.http.post(this.apiSAP + '/api/impresion/masterdomicilio', options).toPromise().catch((err) => {
        if (err) {
          this.presentToast('Error al imprimir', 'danger')
          return
        }
      });
    } else {
      this.http.post(this.apiSAP + '/api/impresion/domicilio', options).toPromise().catch((err) => {
        if (err) {
          this.presentToast('Error al imprimir', 'danger')
          return
        }
      });

      this.presentToast('Se imprimio correctamente', 'success')
    }

    console.log(options)
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
