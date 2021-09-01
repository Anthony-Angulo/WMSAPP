import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SettingsService } from '../../../../services/settings.service';
import { NavExtrasService } from '../../../../services/nav-extras.service';
import { getSettingsFileData } from '../../../commons';
import {
  Platform,
  ToastController,
  LoadingController,
  AlertController
}
  from '@ionic/angular';

@Component({
  selector: 'app-product-batch',
  templateUrl: './product-batch.page.html',
  styleUrls: ['./product-batch.page.scss'],
})
export class ProductBatchPage implements OnInit {

  productDetail: any;
  productBatch: any;
  load: any;

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
    this.productDetail = this.navExtras.getInventoryDetail();
    console.log(this.productDetail)
    await this.presentLoading("Buscando lotes..");

    this.http.get(`${environment.apiCCFN}/inventoryCodebar/${this.productDetail.ID}`).toPromise().then((resp: any) => {
      this.productBatch = resp;
      console.log(resp)
    }).catch(err => {
      console.log(err)
    }).finally(() => { this.hideLoading() })
  }

  async promptelminateBatch(index:number) {
    const alert = await this.alertController.create({
      header: 'Eliminar Lote',
      message: 'Si elimina el lote modificara la cantidad contada. Desea continuar?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Si',
          handler: () => {
            this.elminateBatch(index)
          }
        }
      ]
    });

    await alert.present();
  }

  async elminateBatch(index:number) {

    this.productBatch[index]

    this.presentLoading("Eliminando lote..");

    let updateDetail = {
      id: this.productDetail.ID,
      quantity: this.productDetail.Quantity - this.productBatch[index].Quantity
    }

    let updateRow = {
      id: this.productDetail.row.InventoryID,
      itemcode: this.productDetail.row.ItemCode,
      quantity: this.productDetail.row.Quantity - this.productBatch[index].Quantity
    } 

    Promise.all([
      this.http.delete(`${environment.apiCCFN}/inventoryCodebar/delete/${this.productBatch[index].ID}`).toPromise(),
      this.http.put(`${environment.apiCCFN}/inventoryDetail`, updateDetail).toPromise(),
      this.http.put(`${environment.apiCCFN}/inventoryProduct`, updateRow).toPromise()
    ]).then(([resDel, resUpDetail, resUpRow]: any) => {
      this.presentToast("Eiminado Correctamente","success");
      this.router.navigate(['/members/full-inventory']);
    }).catch(async err => {
      console.log(err)
    }).finally(() => {this.hideLoading()})
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
