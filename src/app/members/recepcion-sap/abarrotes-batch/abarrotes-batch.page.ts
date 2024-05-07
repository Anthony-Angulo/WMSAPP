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
  uom: any;
  codeBar: any;

  banderaFaltaLote: boolean = false;
  banderaFaltaFP: boolean = false;
  banderaFaltaFC: boolean = false;
  peso: number;
  cantidadTarimas: number;

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
    // this.uoms = this.productData.Uoms;
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
    // this.cantidadEscaneada--
    // this.cantidadPeso = this.cantidadPeso - Number(this.detail[index].quantity)
    this.lotes.splice(index, 1)
    this.cantidadTarimas--

  }
  getGS1Data() {

    if (this.codeBar == '') return;

    let pedimento = this.navExtras.getPedimento()

    if (pedimento == undefined) {
      this.presentToast('Debes agregar pedimento', 'warning')
      return
    }

    if (this.cantidad == undefined) {
      this.presentToast("Debes agregar cantidad", 'warning');
      return
    }


    if (this.productData.Detail.PurPackUn == 1) {
      if (Number(this.cantidad) > 100) {
        this.presentToast("La cantidad excede maximo de cajas por tarima", 'warning');
        this.codeBar = '';
        document.getElementById('input-codigo').setAttribute('value', '');
        document.getElementById('input-codigo').focus();
        return
      }
    }

    if (this.productData.Detail.PurPackUn != 1) {
      if (Number(this.cantidad) > this.productData.Detail.PurPackUn) {
        this.presentToast("La cantidad excede maximo de cajas por tarima", 'warning');
        this.codeBar = '';
        document.getElementById('input-codigo').setAttribute('value', '');
        document.getElementById('input-codigo').focus();
        return
      }
    }

    let prodDetail = {
      name: '',
      expirationDate: '',
      manufacturingDate: '',
      quantity: 0,
      code: '',
      att1: '',
      pedimento: '',
      Location: ''
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


        if (answer.parsedCodeItems[x].ai == '3201' || answer.parsedCodeItems[x].ai == '3202' || answer.parsedCodeItems[x].ai == '3200') {
          prodDetail.quantity = Number(Number(Number(this.cantidad * Number(answer.parsedCodeItems[x].data)) / 2.2046).toFixedNoRounding(7));
          this.peso = prodDetail.quantity;
          console.log(Number(Number(answer.parsedCodeItems[x].data)).toFixedNoRounding(4))
        } else if (answer.parsedCodeItems[x].ai == '3101' || answer.parsedCodeItems[x].ai == '3102') {
          prodDetail.quantity = Number(Number(this.cantidad * Number(answer.parsedCodeItems[x].data)).toFixedNoRounding(4));
          this.peso = prodDetail.quantity;
        }
      }
    } catch (err) {
      console.log(err)
    }

    // if(this.banderaFaltaLote == true) {
    //   this.presentToast("Ingresa Lote.", "warning");
    //   this.codeBar = '';
    //   document.getElementById('input-codigo').setAttribute('value', '');
    //   document.getElementById('input-codigo').focus();
    //   return
    // }

    // if(this.banderaFaltaFP == true) {
    //   this.presentToast("Ingresa fecha de produccion.", "warning");
    //   this.codeBar = '';
    //   document.getElementById('input-codigo').setAttribute('value', '');
    //   document.getElementById('input-codigo').focus();
    //   return
    // }

    // if(this.banderaFaltaFC == true) {
    //   this.presentToast("Ingresa fecha de caducidad.", "warning");
    //   this.codeBar = '';
    //   document.getElementById('input-codigo').setAttribute('value', '');
    //   document.getElementById('input-codigo').focus();
    //   return
    // }

    this.codeBar = '';
    document.getElementById('input-codigo').setAttribute('value', '');
    document.getElementById('input-codigo').focus();
    // this.lotes.push(prodDetail);
    // this.imprimirTarima(prodDetail);
  }

  // public addLote() {


  //   let pedimento = this.navExtras.getPedimento()

  //   if (pedimento == undefined) {
  //     this.presentToast('Debes agregar pedimento', 'warning')
  //     return
  //   }

  //   if (this.cantidad == undefined) {
  //     this.presentToast("Debes agregar cantidad", 'warning');
  //     return
  //   }

  //   if(this.lote == undefined ) {
  //     this.presentToast("Debes agregar lote", "warning");
  //     return
  //   }

  //   if(this.FechaCad == undefined) {
  //     this.presentToast("Debes agregar fecha de expiracion", "warning");
  //     return
  //   }

  //   if(this.FechaProd == undefined) {
  //     this.presentToast("Debes agregar fecha de produccion", "warning");
  //     return
  //   }

  //   let prodDetail = {
  //     name: this.lote,
  //     expirationDate: this.FechaCad.split('T')[0],
  //     manufacturingDate: formatDate(this.FechaProd.split('T')[0], 'yyyy-MM-dd', 'en-US'),
  //     quantity:  Number(Number(Number(this.cantidad * Number(this.productData.Detail.NumInSale)) / 2.2046).toFixedNoRounding(7)),
  //     code: '',
  //     att1: '',
  //     pedimento: (pedimento) ? pedimento : '',
  //     Location: ''
  //   }

  //   // this.lotes.push(prodDetail);

  //   // console.log(this.lotes)

  //   this.imprimirTarima(prodDetail);

  // }

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

  async imprimirTarima(prodDetail: any) {
    await this.presentLoading('Imprimiendo etiqueta...');

    this.http.get(`${environment.apiSAP}/api/Impresion/PruebaReciboTarima?Itemcode=${this.productData.ItemCode}&Total=${Number(this.peso)}
    &UoM=${this.productData.UomEntry}&DocNum=${this.productData.DocNum}&Cajas=${Number(this.cantidad)}&printer=Label-Test23`).toPromise()
      .then((x: any) => {
        console.log(x)
        prodDetail.Location = x;
        this.lotes.push(prodDetail);
        this.cantidadTarimas = this.lotes.length
        this.presentToast("Se imprimio Correctamente", "success");
      }).catch((error) => {
        this.presentToast(error.error.error, 'danger')
      }).finally(() => {
        this.hideLoading()
        document.getElementById('input-codigo').focus();
      });
  }

  captureData() {

    console.log(this.productData)
    if (this.cantidad == 0) {
      this.productData.count = this.cantidad
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/recepcion-sap'])
      return
    }

    let qtyLote;

    if(this.productData.UomEntry == this.uom.UomEntry) {
      this.productData.count = this.cantidad
    } else {
      let factor = this.productData.Uoms.find((x: any) => x.UomEntry == this.productData.UomEntry);
      console.log(factor);
      this.productData.count = Number(this.cantidad / factor.BaseQty)
      qtyLote = Number(this.cantidad / factor.BaseQty)
    }

    this.lotes.push({
      name: 'SI',
      expirationDate: '2024-01-01',
      quantity:  this.productData.count.toFixedNoRounding(4),
      code: '',
      att1: '',
      pedimento: ''
    });

  }
  acceptRecepton() {

    // if (this.lotes.length == 0) {
    //   this.presentToast('Falta agregar lote', 'warning');
    //   return
    // }



    // let invQty = this.lotes.map(x => x.quantity).reduce((a, b) => a + b, 0);
    // let dif = Math.abs(Number(Number(invQty).toFixedNoRounding(4)) - Number(this.productData.OpenInvQty))

    // if(dif < 2) {
    //   this.productData.count = this.productData.OpenInvQty;
    // }

    // if(invQty !)

    console.log(this.productData)
    if (this.cantidad == 0) {
      this.productData.count = this.cantidad
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/recepcion-sap'])
      return
    }
    let qtyLote;
    if (this.productData.UomEntry == this.uom.UomEntry) {
      this.productData.count = this.cantidad
      qtyLote = this.cantidad
    } else {
      let factor = this.productData.Uoms.find((x: any) => x.UomEntry == this.productData.UomEntry);
      console.log(factor);
      this.productData.count = Number(this.cantidad / factor.BaseQty)
      qtyLote = Number(this.cantidad / factor.BaseQty)
    }

    // if (this.productData.Detail.ManBtchNum == 'Y') {

    if (this.productData.UomEntry == '486' || this.productData.UomEntry == '485') {
      this.lotes.push({
        name: 'SI',
        expirationDate: '2024-01-01',
        quantity: Number(this.productData.OpenInvQty),
        code: '',
        att1: '',
        pedimento: ''
      });
    } else {
      this.lotes.push({
        name: this.lote,
        expirationDate: '2024-01-01',
        quantity: Number(qtyLote).toFixedNoRounding(4),
        code: '',
        att1: '',
        pedimento: ''
      });
    }
    // let factor = this.productData.Uoms.find((x:any) => x.UomEntry == this.productData.UomEntry);

    // }

    this.productData.detalle = this.lotes
    this.receptionService.setReceptionData(this.productData)
    this.router.navigate(['/members/recepcion-sap'])


    // if (this.productData.Detail.QryGroup41 == 'Y') {
    //   this.productData.count = this.cantidad
    //   this.receptionService.setReceptionData(this.productData)
    //   this.router.navigate(['/members/recepcion-sap'])
    // } else {
    //   this.productData.count = this.peso;
    //   // this.productData.count = this.lotes.map(lote => lote.quantity).reduce((a, b) => a + b, 0)
    //   this.productData.detalle = this.lotes
    //   this.receptionService.setReceptionData(this.productData)
    //   this.router.navigate(['/members/recepcion-sap'])
    // }

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
