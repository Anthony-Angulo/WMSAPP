import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SettingsService } from '../../../services/settings.service';
import { NavExtrasService } from '../../../services/nav-extras.service';
import { Router } from '@angular/router';
import { Platform, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { getSettingsFileData } from '../../commons';
import { Settings } from '../../../interfaces/settings';
declare var parseBarcode: any;
@Component({
  selector: 'app-scangs1',
  templateUrl: './scangs1.component.html',
  styleUrls: ['./scangs1.component.scss'],
})
export class Scangs1Component implements OnInit {

  scannedCode:any;
  answer:any;
  itemCode: any;
  productData: any;
  appSettings: Settings;
  load: any;

  constructor(private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private platform: Platform,
    private settings: SettingsService,
    private alertController: AlertController,
    private navExtras: NavExtrasService,
    private loading: LoadingController,) { }

  ngOnInit() {
    this.appSettings = getSettingsFileData(this.platform, this.settings);
  }

  async getProduct() {

    await this.presentLoading('Buscando producto....');


    this.http.get(`${this.appSettings.apiSAP}/api/Products/Detail/${this.itemCode.toUpperCase()}`).toPromise().then((val:any) => {
      this.productData = val;
    }).catch(async err => {
        this.presentToast(err.error, "danger");
    }).finally(() => {
      this.hideLoading();
    });
  }

  getGs1Data() {
    if(this.scannedCode == '') return
    console.log(this.scannedCode)

    try {
      this.answer = parseBarcode(this.scannedCode);
      console.log(this.answer)
    } catch(e) {
      console.log(e)
      this.presentToast("Codigo de barra sin estructura correcta. Favor de contactar datos maestros para ingreso manual de GTIN","warning");
    }
    
    document.getElementById('input-codigo').setAttribute('value', '');
    document.getElementById('input-codigo').focus();
  }

  async saveGTIN() {
    await this.presentLoading('Guardando GTIN....');

    let output = {
      SupplierNumber: this.answer.parsedCodeItems[0].data,
      id: this.productData.Detail.ItemCode
    }

    this.http.post(`${this.appSettings.apiSAP}/api/Products/UpdateGTIN`, output).toPromise().then((val:any) => {
    this.presentToast("Se guardo correctamente", "success");
    this.productData = undefined;
    this.answer = undefined;
    this.itemCode = '';
    }).catch(async err => {
      if (err.status == 401) {
        this.presentToast(err.error, "danger");
      } else {
        this.presentToast(err.error, "danger");
      }
    }).finally(() => {
      this.hideLoading();
    });
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      position: "bottom",
      color: color,
      duration: 2000
    });
    toast.present();
  }

  async presentLoading(msg: string) {
    this.load = await this.loading.create({
      message: msg,
      duration: 3000
    });

    await this.load.present()
  }

  hideLoading() {
    this.load.dismiss()
  }


}
