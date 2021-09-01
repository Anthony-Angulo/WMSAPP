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
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit {

  productInfo: any;
  appSettings: any;
  productRow: any;
  productDetail: any;
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

    this.productInfo = this.navExtras.getInventoryProduct();
    this.appSettings = getSettingsFileData(this.platform, this.settings);

    await this.presentLoading("Buscando detalle de Producto..")

    return this.http.get(`${environment.apiCCFN}/inventoryProduct/${this.productInfo.headerId}/${this.productInfo.Detail.ItemCode}`).toPromise()
      .then((res:any) => {
        this.productRow = res;
        console.log(this.productRow)
        return this.http.get(`${environment.apiCCFN}/inventoryDetail/${this.productRow[0].ID}`).toPromise()
      }).then((detail: any) => {
        this.productDetail = detail;
      }).catch(err => {
        console.log(err)
      }).finally(() => { this.hideLoading() });

  }

  goToProduct(index: number) {
    if(this.productRow[0].NeedBatch == 'Y') {
      this.productDetail[index].row = this.productRow[0]
      this.navExtras.setInventoryDetail(this.productDetail[index]);
      this.router.navigate(['/members/inventory-product-batch']);
    } else {
      this.promptMod(index)
    }
  }

  async promptMod(index:number) {
    const alert = await this.alertController.create({
      header: 'Cantidad Nueva',
      message: 'Ingresa cantidad Nueva',
      inputs: [
        {
          name: 'cantidad',
          type: 'text',
        },
      ],
      buttons: [
        {
          text: 'Aceptar',
          handler: (data) => {
            let updateRow;

            if (data.cantidad == '') {
              this.presentToast('Debes ingresar una cantidad', 'warning')
              this.promptMod(index)
            } else {

              console.log(this.productDetail[index])
              console.log(this.productRow)

              if(data.cantidad > this.productDetail[index].Quantity) {

                let dif = data.cantidad - this.productDetail[index].Quantity;

                updateRow = {
                  id: this.productRow[0].InventoryID,
                  itemcode: this.productRow[0].ItemCode,
                  quantity: this.productRow[0].Quantity + dif
                } 

              } else {

                let dif =this.productDetail[index].Quantity - data.cantidad;

                updateRow = {
                  id: this.productRow[0].InventoryID,
                  itemcode: this.productRow[0].ItemCode,
                  quantity: this.productRow[0].Quantity - dif
                } 
              }

              let updateDetail = {
                id: this.productDetail[index].ID,
                quantity: data.cantidad
              }
          
              Promise.all([
                this.http.put(`${environment.apiCCFN}/inventoryDetail`, updateDetail).toPromise(),
                this.http.put(`${environment.apiCCFN}/inventoryProduct`, updateRow).toPromise()
              ]).then(([respDet, respRow]: any) => {
                this.presentToast("Modificado Correctamente","success");
                this.router.navigate(['/members/full-inventory']);
              }).catch(async err => {
                console.log(err)
              });
              
            }
          }
        }
      ]
    });

    await alert.present();
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
