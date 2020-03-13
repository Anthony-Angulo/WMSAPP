import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { SettingsService } from '../../../services/settings.service';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-abarrotes',
  templateUrl: './abarrotes.page.html',
  styleUrls: ['./abarrotes.page.scss'],
})
export class AbarrotesPage implements OnInit {

  productData: any
  cantidad: number
  tarima
  data
  porcentaje: any;
  sucursal: any;
  stock: any;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private platform: Platform,
    private settings: SettingsService,
    private receptionService: RecepcionDataService) { }

  ngOnInit() {
    this.productData = this.receptionService.getOrderData()
    if (this.productData.count) {
      this.cantidad = this.productData.count
    }

    if (!this.productData.pallet) {
      this.productData.pallet = ''
    }

    if (this.platform.is("cordova")) {
      this.data = this.settings.fileData
      this.porcentaje = this.data.porcentaje
      this.sucursal = this.data.sucursal
    } else {
      this.porcentaje = "10"
      this.sucursal = "S01"
    }

    this.http.get(environment.apiSAP + '/api/batch/' + this.sucursal + '/' + this.productData.ItemCode).toPromise().then((val: any) => {
      this.stock = val.stock
      console.log(this.stock)
    }).catch((error) => {
      console.log(error)
    })
  }

  acceptRecepton() {

    let validPercent = (Number(this.porcentaje) / 100) * Number(this.productData.OpenInvQty)
    let validQuantity = Number(validPercent) + Number(this.productData.OpenInvQty)

    if (Number(this.cantidad) > Number(validQuantity)) {
      this.presentToast('Cantidad ingresada excede de la cantidad solicitada', 'warning')
    } else {
      if (this.productData.count != 0 && this.cantidad == 0) {
        this.productData.count = this.cantidad
        this.productData.pallet = this.tarima
        this.receptionService.setReceptionData(this.productData)
        this.router.navigate(['/members/transferencia-sap'])
        return
      } else if (this.cantidad <= 0) {
        this.presentToast('Debe igresar una cantidad valida', 'warning')
        return
      } else {
        this.productData.count = this.cantidad
        this.productData.pallet = this.tarima
        this.receptionService.setReceptionData(this.productData)
        this.router.navigate(['/members/transferencia-sap'])
      }
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
