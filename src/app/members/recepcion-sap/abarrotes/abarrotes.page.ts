import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { Platform } from '@ionic/angular';
import { SettingsService } from '../../../services/settings.service';
import { getSettingsFileData } from '../../commons';

@Component({
  selector: 'app-abarrotes',
  templateUrl: './abarrotes.page.html',
  styleUrls: ['./abarrotes.page.scss'],
})
export class AbarrotesPage implements OnInit {

  public appSettings: any;

  productData: any
  cantidad: number
  data: any
  porcentaje: any;

  constructor(
    private toastController: ToastController,
    private router: Router,
    private receptionService: RecepcionDataService,
    private platform: Platform,
    private settings: SettingsService) { }

  ngOnInit() {


    this.appSettings = getSettingsFileData(this.platform, this.settings);

    this.productData = this.receptionService.getOrderData()

    if (this.productData.count) {
      this.cantidad = this.productData.count
    }
  }

  acceptRecepton() {

    let validPercent = (Number(this.appSettings.porcentaje) / 100) * Number(this.productData.OpenInvQty)
    let validQuantity = Number(validPercent) + Number(this.productData.OpenInvQty)

    if (Number(this.cantidad) > Number(validQuantity)) {
      this.presentToast('Cantidad ingresada excede de la cantidad solicitada', 'warning');
      return
    }

    if (this.cantidad == 0) {
      this.productData.count = this.cantidad
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/recepcion-sap'])
      return
    }

    this.productData.count = this.cantidad
    this.receptionService.setReceptionData(this.productData)
    this.router.navigate(['/members/recepcion-sap'])


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
