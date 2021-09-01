import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { getSettingsFileData } from '../../commons';
import { environment } from 'src/environments/environment';
import { SettingsService } from '../../../services/settings.service';
import { NavExtrasService } from '../../../services/nav-extras.service';
import {
  Platform,
  ToastController,
  LoadingController,
  AlertController
}
  from '@ionic/angular';

  const USER = 'user';

@Component({
  selector: 'app-abarrotes',
  templateUrl: './abarrotes.page.html',
  styleUrls: ['./abarrotes.page.scss'],
})
export class AbarrotesPage implements OnInit {

  public productInfo: any;
  public appSettings: any;
  public warehouseCode: string;
  public apiSAPURL: string;
  public uom: any;
  public total: number;
  public cantidad: number;
  public location: string;
  public load: any;
  public rows = [];
  public lote: string;
  public token: any;

  constructor(private navExtras: NavExtrasService,
    private http: HttpClient,
    private router: Router,
    private platform: Platform,
    private loading: LoadingController,
    private alertController: AlertController,
    private settings: SettingsService,
    private toastController: ToastController,
    private storage: Storage) { }

 async ngOnInit() {

    this.productInfo = this.navExtras.getInventoryProduct();
    this.appSettings = getSettingsFileData(this.platform, this.settings);
   

    await this.http.get(`${this.appSettings.apiSAP}/api/products/detail/${this.productInfo.ItemCode.toUpperCase()}`).toPromise().then((resp: any) => {
        this.productInfo.uom = resp.uom;
        this.productInfo.Detail = resp.Detail;
    }).catch((err) => {
        this.presentToast(err.message, "danger");
    });

    this.uom = this.productInfo.uom.find(x => this.productInfo.Detail.NumInSale == x.BaseQty);
    this.promptLocation();
  }

  async promptLocation() {
    const alert = await this.alertController.create({
      header: 'Ubicacion ',
      message: 'Ingresa ubicacion de producto.',
      inputs: [
        {
          name: 'Ubicacion',
          type: 'text',
        },
      ],
      buttons: [
        {
          text: 'Aceptar',
          handler: (data) => {
            if (data.Ubicacion == '') {
              this.presentToast('Debes ingresar una ubicacion', 'warning')
              this.promptLocation()
            } else {
              this.location = data.Ubicacion
            }

          }
        }
      ]
    });

    await alert.present();
  }

  public calculateTotal(): void {
    this.total = Number(this.uom.BaseQty * this.cantidad)
  }

  productDetail() {
    this.router.navigate(['/members/inventory-product-detail']);
  }


 async saveProduct() {

    if (this.total == undefined) {
      this.presentToast("Debes ingresar una cantidad", "warning")
      return
    }

    let codeBars = []
    let datos = []

    let user = await this.storage.get(USER);


    this.presentLoading('Guardando...');

    return this.http.get(`${environment.apiCCFN}/inventoryProduct/${this.productInfo.headerId}/${this.productInfo.Detail.ItemCode}`).toPromise().then((res: any) => {

      if (res.length > 0) {
        let update = {
          id: res[0].ID,
          itemcode: this.productInfo.Detail.ItemCode,
          quantity: this.total + res[0].Quantity
        }

        this.productInfo.productId = res[0].ID

        return this.http.put(`${environment.apiCCFN}/inventoryProduct`, update).toPromise()
      } else {

         datos.push([this.productInfo.Detail.ItemCode,
          this.productInfo.Detail.ItemName,
          this.total,
          0,
          this.productInfo.Detail.ManBtchNum,
          this.productInfo.Detail.U_IL_TipPes,
          user.id,
          this.productInfo.headerId])

        return this.http.post(`${environment.apiCCFN}/inventoryProduct`, datos).toPromise()
      }
    }).then((res: any) => {

      let detail = {
        quantity: this.total,
        zone: this.location,
        userId: user.id,
        inventoryProductId: (res.insertId == 0) ? this.productInfo.productId : res.insertId
      }

      return this.http.post(`${environment.apiCCFN}/inventoryDetail`, detail).toPromise()

    }).then((res: any) => {

      if(this.productInfo.Detail.ManBtchNum == 'Y') {
        codeBars.push([
          this.total,
          this.lote,
          'Sin Codigo de Barra',
          res.id
        ])
      }

      return this.http.post(`${environment.apiCCFN}/inventoryCodeBar`, codeBars).toPromise()
    }).then((res: any) => {
      if(res) {
        this.presentToast('Guardado Correctamente', 'success')
        this.cantidad = 0
        this.router.navigate(['/members/partial-inventory'])
      }
    }).catch((err: any) => {
      this.presentToast(err.message, "danger")
    }).finally(() => this.hideLoading());

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
