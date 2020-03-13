import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { SettingsService } from '../../../services/settings.service';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';

@Component({
  selector: 'app-abarrotes',
  templateUrl: './abarrotes.page.html',
  styleUrls: ['./abarrotes.page.scss'],
})
export class AbarrotesPage implements OnInit {

  productData: any
  cantidad: number
  data: any
  porcentaje: any;

  constructor(
    private toastController: ToastController,
    private settings: SettingsService,
    private router: Router,
    private platform: Platform,
    private receptionService: RecepcionDataService) { }

  ngOnInit() {

    if (this.platform.is("cordova")) {
      this.data = this.settings.fileData
      this.porcentaje = this.data.porcentaje
    } else {
      this.porcentaje = "10"
    }

    this.productData = this.receptionService.getOrderData()
    if (this.productData.count) {
      this.cantidad = this.productData.count
    }
  }

  acceptRecepton() {

    let validPercent = (Number(this.porcentaje) / 100) * Number(this.productData.OpenInvQty)
    let validQuantity = Number(validPercent) + Number(this.productData.OpenInvQty)

    if (Number(this.cantidad) > Number(validQuantity)) {
      this.presentToast('Cantidad ingresada excede de la cantidad solicitada', 'warning')
    } else {
      if (this.productData.count != 0 && this.cantidad == 0) {
        console.log(1)
        this.productData.count = this.cantidad
        this.receptionService.setReceptionData(this.productData)
        this.router.navigate(['/members/recepcion-sap'])
        return
      } else if (this.cantidad <= 0) {
        this.presentToast('Debe igresar una cantidad valida', 'warning')
        return
      } else {
        this.productData.count = this.cantidad
        this.receptionService.setReceptionData(this.productData)
        this.router.navigate(['/members/recepcion-sap'])
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
