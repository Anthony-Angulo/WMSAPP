import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { SettingsService } from '../../../services/settings.service';
import { Platform } from '@ionic/angular';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';

@Component({
  selector: 'app-abarrotes',
  templateUrl: './abarrotes.page.html',
  styleUrls: ['./abarrotes.page.scss'],
})
export class AbarrotesPage implements OnInit {

  productData: any
  cantidad: number = 0
  tarima
  data
  porcentaje: any;


  constructor(
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

    if (this.platform.is("cordova")) {
      this.data = this.settings.fileData
      this.porcentaje = this.data.porcentaje
    } else {
      this.porcentaje = "10"
    }
  }

  acceptRecepton() {

    let validPercent = Number(this.productData.OpenQty) / Number(this.porcentaje)
    let validQuantity = Number(validPercent) + Number(this.productData.OpenQty)

    if(Number(this.cantidad) > Number(validQuantity)){
      this.presentToast('Cantidad ingresada excede de la cantidad solicitada','warning')
    } else {
      if (this.productData.count != 0 && this.cantidad == 0) {
        this.productData.count = this.cantidad
        this.productData.pallet = this.tarima
        this.receptionService.setReceptionData(this.productData)
        this.router.navigate(['/members/surtido-sap'])
        return
      } else if (this.cantidad <= 0) {
        this.presentToast('Debe igresar una cantidad valida', 'warning')
        return
      } else {
        this.productData.count = this.cantidad
        this.productData.pallet = this.tarima
        this.receptionService.setReceptionData(this.productData)
        this.router.navigate(['/members/surtido-sap'])
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
