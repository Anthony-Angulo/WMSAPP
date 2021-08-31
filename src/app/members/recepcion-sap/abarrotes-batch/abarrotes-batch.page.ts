import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { SettingsService } from '../../../services/settings.service';
import { Platform } from '@ionic/angular';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { getSettingsFileData } from '../../commons';

@Component({
  selector: 'app-abarrotes-batch',
  templateUrl: './abarrotes-batch.page.html',
  styleUrls: ['./abarrotes-batch.page.scss'],
})
export class AbarrotesBatchPage implements OnInit {

  public appSettings: any;

  productData: any
  cantidad: number
  FechaCad: String
  lotes = []
  lote: any
  data: any;
  porcentaje: any;

  constructor(
    private toastController: ToastController,
    private router: Router,
    private navExtras: NavExtrasService,
    private platform: Platform,
    private settings: SettingsService,
    private receptionService: RecepcionDataService
  ) { }

  ngOnInit() {

    this.productData = this.receptionService.getOrderData();

    this.appSettings = getSettingsFileData(this.platform, this.settings);

    var date = new Date();
    date = new Date(date.setFullYear(date.getFullYear() + 1)); 
    this.FechaCad = date.toISOString();

    if (this.productData.count) {
      this.cantidad = this.productData.count
    }

    if (!this.productData.detalle) {
      this.productData.detalle = []
    } else {
      this.lotes = this.productData.detalle
    }

  }

  eliminar(index) {
    this.lotes.splice(index, 1)
  }

  addLote() {

    if (this.FechaCad == undefined || this.cantidad <= 0 || this.lote == undefined || this.lote == '') {
      this.presentToast('Datos faltantes', 'warning')
      return
    }

    if (this.productData.Detail.QryGroup2 == "Y") {
      let pedimento = this.navExtras.getPedimento()

      if (pedimento == undefined) {
        this.presentToast('Debes agregar pedimento', 'warning')
      } else {
        

        if (Number.isInteger(Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4)))) {
          this.lotes.push({
            name: this.lote,
            expirationDate: this.FechaCad,
            quantity: Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4)),
            code: '',
            att1: '',
            pedimento: pedimento
          })
        } else {
          let dif = Math.abs(Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4)) - Number(this.productData.OpenInvQty))

          console.log(dif)

          if (dif < 2) {
            this.lotes.push({
              name: this.lote,
              expirationDate: this.FechaCad,
              quantity: Number(this.productData.OpenInvQty),
              code: '',
              att1: '',
              pedimento: pedimento
            })
          } else {
            let validPercent = (Number(this.porcentaje) / 100) * Number(this.productData.OpenInvQty)
            let validQuantity = Number(validPercent) + Number(this.productData.OpenInvQty)

            console.log(validPercent)
            console.log(validQuantity)

            if (Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4)) > Number(validQuantity)) {
              this.presentToast('Cantidad ingresada excede de la cantidad solicitada', 'warning')
            } else {
              this.lotes.push({
                name: this.lote,
                expirationDate: this.FechaCad,
                quantity: Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4)),
                code: '',
                att1: '',
                pedimento: pedimento
              })
            }
          }
        }
      }
    } else {

      if (Number.isInteger(Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4)))) {
        this.lotes.push({
          name: this.lote,
          expirationDate: this.FechaCad,
          quantity: Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4)),
          code: '',
          att1: '',
          pedimento: ''
        })
      } else {
        let dif = Math.abs(Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4)) - Number(this.productData.OpenInvQty))

        console.log(dif)

        if (dif < 2) {
          this.lotes.push({
            name: this.lote,
            expirationDate: this.FechaCad,
            quantity: Number(this.productData.OpenInvQty),
            code: '',
            att1: '',
            pedimento: ''
          })
        } else {
          let validPercent = (Number(this.porcentaje) / 100) * Number(this.productData.OpenInvQty)
          let validQuantity = Number(validPercent) + Number(this.productData.OpenInvQty)

          console.log(validPercent)
          console.log(validQuantity)

          if (Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4)) > Number(validQuantity)) {
            this.presentToast('Cantidad ingresada excede de la cantidad solicitada', 'warning')
          } else {
            this.lotes.push({
              name: this.lote,
              expirationDate: this.FechaCad,
              quantity: Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4)),
              code: '',
              att1: '',
              pedimento: ''
            })
          }
        }
      }
    }
  }

  acceptRecepton() {

    if(this.lotes.length == 0) {
      this.presentToast('Falta agregar lote', 'warning');
      return
    }

    if(this.cantidad == 0) {
      this.productData.count = this.cantidad
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/recepcion-sap'])
      return
    }

    if (this.productData.Detail.QryGroup41 == 'Y') {
      this.productData.count = this.cantidad
      this.productData.detalle = this.lotes
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/recepcion-sap'])
    } else {
      this.productData.count = this.lotes.map(lote => lote.quantity).reduce((a, b) => a + b, 0)
      this.productData.detalle = this.lotes
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/recepcion-sap'])
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
