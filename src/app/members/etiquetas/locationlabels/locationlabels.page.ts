import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../services/settings.service';
import { environment } from 'src/environments/environment';
import { ToastController, LoadingController } from '@ionic/angular';
import { getSettingsFileData } from '../../commons';
import { Platform } from '@ionic/angular';
import { Settings } from '../../../interfaces/settings';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';



@Component({
  selector: 'app-locationlabels',
  templateUrl: './locationlabels.page.html',
  styleUrls: ['./locationlabels.page.scss'],
})
export class LocationlabelsPage implements OnInit {

  appSettings: any;
  load: any;
  createdCode = null;
  almacenes: any = [];


  almacen: string;
  seccion: string;
  pasillo: string;
  rack: string;
  nivel: string;
  posicion: string;

  constructor(private http: HttpClient,
    private settings: SettingsService,
    private toastController: ToastController,
    private loading: LoadingController,
    private platform: Platform) { }

  async ngOnInit() {
    this.appSettings = getSettingsFileData(this.platform, this.settings);

    await this.presentLoading('Cargando...');

    this.http.get(`${environment.apiCCFN}/warehouse`)
      .toPromise().then((x: any) => {
        this.almacenes = x;
      })
      .catch((err: Error) => {
        console.log(err);
      })
      .finally(() => this.hideLoading());
  }

  async printLabel() {
    this.createdCode = this.almacen + '-' + this.seccion + '-' + this.pasillo + '-' + this.rack + '-' + this.nivel + '-' + this.posicion;
    
    let output = {
      Codigo: this.createdCode,
      IDPrinter: 'Etiquetas_Tarima'
    }

    this.http.post(`${environment.apiSAP}/api/Impresion/QR`, output).toPromise().then((res: any) => {
      console.log(res)
      this.presentToast('impreso correctamente','success');
    }).catch((err: any) => {
      console.log(err)
      this.presentToast('Error al imprimir', 'danger')
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
