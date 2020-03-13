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

    if (this.platform.is("cordova")) {
      this.Filedata = this.settings.fileData
      this.warehouseCode = this.Filedata.sucursal
      this.apiSAPURL = this.Filedata.apiSAP
    } else {
      this.apiSAPURL = environment.apiSAP
      this.warehouseCode = "S01"
    }

    this.http.get(this.apiSAPURL + '/api/products/detail/' + this.productInfo
      .ItemCode.toUpperCase()).toPromise().then((resp: any) => {
        this.productInfo.uom = resp.uom
        this.promptLocation()
      }).catch((err) => {
        console.log(err)
      })
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
      SAPheader: this.productInfo.InventorySAPHeader,
      ItemCode: this.productInfo.ItemCode
    }

    this.http.post(environment.apiWMS + '/closeProduct', data)
      .toPromise().then((resp: any) => {
        if (resp.success) {
          this.presentToast('Se cerro correctamente', 'success')
          this.router.navigate(['/members/partial-inventory-detail'])
        }
      }).catch(err => {
        console.log(err)
        this.presentToast('Error al cerrar producto', 'danger')
      }).finally(() => {
        this.hideLoading()
      })
  }

  async saveProduct() {

    if(this.total == undefined){
      this.presentToast("Debes ingresar una cantidad","warning")
    } else {
      await this.presentLoading("Guardando...")

      const codeBars = []

      this.storage.get(NAME).then(userLogedIn => {
        let detail = [{
          SapHeaderId: this.productInfo.id,
          ItemCode: this.productInfo.ItemCode,
          ItemName: this.productInfo.ItemName,
          Location: this.location,
          InvQuantity: this.total,
          EmployeeName: userLogedIn
        }]

        let datos = {
          detail,
          codeBars
        }

        this.http.post(environment.apiWMS + '/addPartialDetail', datos).toPromise()
          .then(() => {
            this.presentToast("Guardado Correctamente", "success")
            this.router.navigate(['members/partial-inventory-detail'])
          }).catch(() => {
            this.presentToast("Error al Guardar", "danger")
          }).finally(() => { this.hideLoading() });
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
