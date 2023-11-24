import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { ToastController, LoadingController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { SettingsService } from '../../../services/settings.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Platform } from '@ionic/angular';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { getSettingsFileData } from '../../commons';
declare var parseBarcode: any;
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
  FechaProd: String
  lotes = []
  lote: any
  data: any;
  load: any;
  porcentaje: any;
  codeBar: any;

  banderaFaltaLote: boolean = false;
  banderaFaltaFP: boolean = false;
  banderaFaltaFC: boolean = false;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private navExtras: NavExtrasService,
    private platform: Platform,
    private settings: SettingsService,
    private loading: LoadingController,
    private receptionService: RecepcionDataService
  ) { }

  ngOnInit() {

    this.productData = this.receptionService.getOrderData();

    this.appSettings = getSettingsFileData(this.platform, this.settings);

    // var date = new Date();
    // date = new Date(date.setFullYear(date.getFullYear() + 1)); 
    // this.FechaCad = date.toISOString();

    if (this.productData.count) {
      this.cantidad = this.productData.count
    }

    if (!this.productData.detalle) {
      this.productData.detalle = []
    } else {
      this.lotes = this.productData.detalle
    }

  }

  getGS1Data() {

    if (this.codeBar == '') return;

    let pedimento = this.navExtras.getPedimento()

    if (pedimento == undefined) {
      this.presentToast('Debes agregar pedimento', 'warning')
      return
    }

    if(this.cantidad == undefined) {
      this.presentToast("Debes agregar cantidad", 'warning');
      return
    }



    let prodDetail = {
      name: '',
      expirationDate: '',
      manufacturingDate: '',
      quantity: 0,
      code: '',
      att1: '',
      pedimento: ''
    }

    try {

      let answer = parseBarcode(this.codeBar);

      console.log(answer.parsedCodeItems.length)

      for (var x = 0; x < answer.parsedCodeItems.length; x++) {
        console.log(answer.parsedCodeItems[x])
        if (answer.parsedCodeItems[x].ai == '10') {
          prodDetail.name = answer.parsedCodeItems[x].data;
          this.lote = answer.parsedCodeItems[x].data;
        } else if (this.lote == undefined) {
          this.banderaFaltaLote = true;
        } else if (this.lote != undefined) {
          prodDetail.name = this.lote;
          this.banderaFaltaLote = false;
        }

        if (answer.parsedCodeItems[x].ai == '11' || answer.parsedCodeItems[x].ai == '13') {
          prodDetail.manufacturingDate = formatDate(answer.parsedCodeItems[x].data, 'yyyy-MM-dd', 'en-US');
          this.FechaProd = formatDate(answer.parsedCodeItems[x].data, 'yyyy-MM-dd', 'en-US');
        } else if (this.FechaProd == undefined) {
          this.banderaFaltaFP = true;
        } else if (this.FechaProd != undefined) {
          prodDetail.manufacturingDate = this.FechaProd.split('T')[0];
          this.FechaProd = formatDate(this.FechaProd.split('T')[0], 'yyyy-MM-dd', 'en-US');
          this.banderaFaltaFP = false;
        }

        if (answer.parsedCodeItems[x].ai == '12') {
          prodDetail.expirationDate = formatDate(answer.parsedCodeItems[x].data, 'yyyy-MM-dd', 'en-US');
          this.FechaCad = formatDate(answer.parsedCodeItems[x].data, 'yyyy-MM-dd', 'en-US');
        } else if (this.productData.Detail.U_IL_DiasCad != '0' && answer.parsedCodeItems[x].ai == '13' || answer.parsedCodeItems[x].ai == '11') {
          prodDetail.expirationDate = new Date(answer.parsedCodeItems[x].data.setDate(answer.parsedCodeItems[x].data.getDate() + Number(this.productData.Detail.U_IL_DiasCad))).toISOString()
          prodDetail.expirationDate = formatDate(prodDetail.expirationDate, 'yyyy-MM-dd', 'en-US');
          this.FechaCad = formatDate(answer.parsedCodeItems[x].data, 'yyyy-MM-dd', 'en-US');
        } else if (this.FechaCad == undefined) {
          this.banderaFaltaFC = true;
        } else if (this.FechaCad != undefined) {
          this.banderaFaltaFC = false;
          prodDetail.expirationDate = this.FechaCad.split('T')[0];
        }


        if (answer.parsedCodeItems[x].ai == '3201' || answer.parsedCodeItems[x].ai == '3202') {
          prodDetail.quantity = Number(Number(Number(this.cantidad * Number(answer.parsedCodeItems[x].data)).toFixedNoRounding(4)) / 2.2046); 
        } else if(answer.parsedCodeItems[x].ai == '3101' || answer.parsedCodeItems[x].ai == '3102'){
          prodDetail.quantity = Number(Number(this.cantidad * Number(answer.parsedCodeItems[x].data)).toFixedNoRounding(4));
        } else {
          prodDetail.quantity = Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4));
        }

        


      }

      if(this.banderaFaltaFC == true) {
        this.presentToast("Debes agregar fecha de caducidad","warning");
        document.getElementById('input-codigo').setAttribute('value', '');
      document.getElementById('input-codigo').focus();
        return
      }

      if(this.banderaFaltaLote == true) {
        this.presentToast("Debes agregar lote", "warning");
        document.getElementById('input-codigo').setAttribute('value', '');
      document.getElementById('input-codigo').focus();
        return
      }

      if(this.banderaFaltaFP == true) {
        this.presentToast("Debes agregar fecha de produccion","warning");
        document.getElementById('input-codigo').setAttribute('value', '');
      document.getElementById('input-codigo').focus();
        return
      }

      this.lotes.push(prodDetail);
      document.getElementById('input-codigo').setAttribute('value', '');
      document.getElementById('input-codigo').focus();
      this.presentToast("Se agrego Correctamente", "success");


    } catch (err) {
      console.log(err);
    }
  }

  async imprimirTarima() {
    await this.presentLoading('Imprimiendo etiqueta...');

    this.http.get(`${environment.apiSAP}/api/Impresion/PruebaReciboTarima?Itemcode=${this.productData.ItemCode}&Total=${Number(this.lotes.map(lote => lote.quantity).reduce((a, b) => a + b, 0))}
    &UoM=${this.productData.UomEntry}&DocNum=${this.productData.DocNum}&Cajas=${Number(this.cantidad)}&printer=${this.appSettings.IpImpresora}`).toPromise()
      .then(() => {
        this.presentToast("Se imprimio Correctamente", "success");
      }).catch((error) => {
        this.presentToast(error.error.error, 'danger')
      }).finally(() => {
        this.hideLoading()
      });


  }

  eliminar(index) {
    this.lotes.splice(index, 1)
  }

  // addLote() {

  //   if (this.FechaCad == undefined || this.cantidad <= 0 || this.lote == undefined || this.lote == '') {
  //     this.presentToast('Datos faltantes', 'warning')
  //     return
  //   }

  //   if (this.productData.Detail.QryGroup2 == "Y") {
  //     let pedimento = this.navExtras.getPedimento()

  //     if (pedimento == undefined) {
  //       this.presentToast('Debes agregar pedimento', 'warning')
  //     } else {


  //       if (Number.isInteger(Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4)))) {
  //         this.lotes.push({
  //           name: this.lote,
  //           expirationDate: this.FechaCad,
  //           quantity: Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4)),
  //           code: '',
  //           att1: '',
  //           pedimento: pedimento
  //         })
  //       } else {
  //         let dif = Math.abs(Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4)) - Number(this.productData.OpenInvQty))

  //         console.log(dif)

  //         if (dif < 2) {
  //           this.lotes.push({
  //             name: this.lote,
  //             expirationDate: this.FechaCad,
  //             quantity: Number(this.productData.OpenInvQty),
  //             code: '',
  //             att1: '',
  //             pedimento: pedimento
  //           })
  //         } else {
  //           let validPercent = (Number(this.porcentaje) / 100) * Number(this.productData.OpenInvQty)
  //           let validQuantity = Number(validPercent) + Number(this.productData.OpenInvQty)

  //           console.log(validPercent)
  //           console.log(validQuantity)

  //           if (Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4)) > Number(validQuantity)) {
  //             this.presentToast('Cantidad ingresada excede de la cantidad solicitada', 'warning')
  //           } else {
  //             this.lotes.push({
  //               name: this.lote,
  //               expirationDate: this.FechaCad,
  //               quantity: Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4)),
  //               code: '',
  //               att1: '',
  //               pedimento: pedimento
  //             })
  //           }
  //         }
  //       }
  //     }
  //   } else {

  //     if (Number.isInteger(Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4)))) {
  //       this.lotes.push({
  //         name: this.lote,
  //         expirationDate: this.FechaCad,
  //         quantity: Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4)),
  //         code: '',
  //         att1: '',
  //         pedimento: ''
  //       })
  //     } else {
  //       let dif = Math.abs(Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4)) - Number(this.productData.OpenInvQty))

  //       console.log(dif)

  //       if (dif < 2) {
  //         this.lotes.push({
  //           name: this.lote,
  //           expirationDate: this.FechaCad,
  //           quantity: Number(this.productData.OpenInvQty),
  //           code: '',
  //           att1: '',
  //           pedimento: ''
  //         })
  //       } else {
  //         let validPercent = (Number(this.porcentaje) / 100) * Number(this.productData.OpenInvQty)
  //         let validQuantity = Number(validPercent) + Number(this.productData.OpenInvQty)

  //         console.log(validPercent)
  //         console.log(validQuantity)

  //         if (Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4)) > Number(validQuantity)) {
  //           this.presentToast('Cantidad ingresada excede de la cantidad solicitada', 'warning')
  //         } else {
  //           this.lotes.push({
  //             name: this.lote,
  //             expirationDate: this.FechaCad,
  //             quantity: Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4)),
  //             code: '',
  //             att1: '',
  //             pedimento: ''
  //           })
  //         }
  //       }
  //     }
  //   }
  // }

  acceptRecepton() {

    if (this.lotes.length == 0) {
      this.presentToast('Falta agregar lote', 'warning');
      return
    }

    if (this.cantidad == 0) {
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

  async presentLoading(msg) {
    this.load = await this.loading.create({
      message: msg,
      // duration: 3000
    });

    await this.load.present()
  }

  hideLoading() {
    // console.log('loading')
    this.load.dismiss()
  }

}
