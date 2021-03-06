import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
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

const NAME = 'USER_NAME';

@Component({
  selector: 'app-abarrotes',
  templateUrl: './abarrotes.page.html',
  styleUrls: ['./abarrotes.page.scss'],
})
export class AbarrotesPage implements OnInit {

  public productInfo: any;
  public Filedata: any;
  public warehouseCode: string;
  public apiSAPURL: string;
  public uom: any;
  public total: number;
  public cantidad: number;
  public location: string;
  public load: any;
  public rows = [];
  public lote: string;

  constructor(private navExtras: NavExtrasService,
    private http: HttpClient,
    private router: Router,
    private platform: Platform,
    private loading: LoadingController,
    private alertController: AlertController,
    private settings: SettingsService,
    private toastController: ToastController,
    private storage: Storage) { }

  ngOnInit() {

    this.productInfo = this.navExtras.getInventoryProduct();
    console.log(this.productInfo)

    if (this.platform.is("cordova")) {
      this.Filedata = this.settings.fileData
      this.warehouseCode = this.Filedata.sucursal
      this.apiSAPURL = this.Filedata.apiSAP
    } else {
      this.apiSAPURL = environment.apiSAP
      this.warehouseCode = "S01"
    }

  }


  public calculateTotal(): void {
    this.total = Number(this.uom.BaseQty * this.cantidad)
  }

  async promptCloseProduct() {
    const alert = await this.alertController.create({
      header: 'Cerrar Producto',
      message: 'Si cierra el producto ya no podra seguir inventariandolo. Confirmar para continuar.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.closeProduct()
          }
        }
      ]
    });

    await alert.present();
  }

  async closeProduct() {

    await this.presentLoading('Cerrando Producto..')

    let data = {
      SAPheader: this.productInfo.headerId,
      ItemCode: this.productInfo.Detail.ItemCode
    }

    this.http.post(environment.apiWMS + '/closeProduct', data)
      .toPromise().then((resp: any) => {
        if (resp.success) {
          this.presentToast('Se cerro correctamente', 'success')
          this.router.navigate(['/members/full-inventory'])
        }
      }).catch(err => {
        console.log(err)
        this.presentToast('Error al cerrar producto', 'danger')
      }).finally(() => {
        this.hideLoading()
      })
  }

  async saveProduct() {

    let codeBars = []

    if(this.productInfo.Detail.ManBtchNum == 'Y'){
       codeBars = [{
        ItemCode: this.productInfo.Detail.ItemCode,
        ItemName: this.productInfo.Detail.ItemName,
        codebar: '',
        Lote: this.lote,
        Quantity: this.total
      }]
    }

    console.log(codeBars)
    if (this.total == undefined) {
      this.presentToast("Debes ingresar una cantidad", "warning")
    } else {
      this.presentLoading('Guardando...')
      this.storage.get(NAME).then(nombre => {
        this.rows.push({
          ItemCode: this.productInfo.Detail.ItemCode,
          ItemName: this.productInfo.Detail.ItemName,
          Location: this.productInfo.location,
          InvQuantity: this.total,
          EmployeeName: nombre
        })

        let datos = {
          SapHeaderId: this.productInfo.headerId,
          ItemCode: this.productInfo.Detail.ItemCode,
          ItemName: this.productInfo.Detail.ItemName,
          UOM: this.uom.BASEUOM,
          ManejaLote: this.productInfo.Detail.ManBtchNum,
          TipoPeso: this.productInfo.Detail.U_IL_TipPes,
          rows: this.rows,
          codeBars
        }

        this.http.post(environment.apiWMS + '/saveOrUpdateInventoryRequestRow', datos).toPromise().then((resp) => {
          this.presentToast('Guardado Correctamente', 'success')
          this.cantidad = 0
          this.router.navigate(['/members/full-inventory'])
        }).catch(err => {
          this.presentToast('Error al guardar', 'danger')
        }).finally(() => {
          this.hideLoading()
        })
      })
    }
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
