import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { SettingsService } from './../../services/settings.service';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-surtido-sap',
  templateUrl: './surtido-sap.page.html',
  styleUrls: ['./surtido-sap.page.scss'],
})
export class SurtidoSapPage implements OnInit {

  load;
  order;
  number;
  searchType;
  products = []
  search;
  ctd
  tarima
  data
  apiSAP: any;

  constructor(
    private http: HttpClient,
    private receptionService: RecepcionDataService,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,
    private platform: Platform,
    private settings: SettingsService,
  ) { }

  ngOnInit() {

    if (this.platform.is("cordova")) {
      this.data = this.settings.fileData
      this.apiSAP = this.data.apiSAP
    } else {
      this.apiSAP = environment.apiSAP
    }
  }

  ionViewWillEnter() {

    let productsScanned = this.receptionService.getReceptionData()


    if(productsScanned == null) {
      return
    }

    
    if (productsScanned.DeliveryRowDetailList) {
      let index = this.order.Lines.findIndex(product => product.ItemCode == productsScanned.ItemCode)
      this.order.Lines[index].count = productsScanned.DeliveryRowDetailList.map(prod => prod.total).reduce((a,b) => a + b, 0)
      let isScanned = this.products.findIndex(prd => prd.ItemCode == productsScanned.ItemCode)
      if(isScanned < 0) {
        this.products.push(productsScanned)
      }
    } else {
      let ind = this.products.findIndex(product => product.ItemCode == productsScanned.ItemCode)
      if (ind >= 0) {
        this.products.splice(ind, 1) 
      }
    }

    console.log(this.products)

    this.receptionService.setReceptionData(null)
  }

  async getOrden() {
    await this.presentLoading('Buscando....')
    this.http.get(this.apiSAP + '/api/order/deliverySAP/' + this.number).toPromise().then((data: any) => {
      this.order = data;
      console.log(this.order)
      return this.order.Lines.map(x => x.ItemCode)
    }).then((codes) => {
      return this.http.get(environment.apiWMS + '/codebardescriptionsVariants/' + codes).toPromise()
    }).then((codebarDescription: any[]) => {
      this.order.Lines.map(item => {
        item.cBDetail = codebarDescription.filter(y => y.codigo_sap == item.ItemCode)
      })
    }).catch(error => {
      if (error.status == 404) {
        this.presentToast('No encontrado o no existe', 'warning')
      } else if (error.status == 400) {
        this.presentToast(error.statusText, 'warning')
      } else if(error.status == 204) {
        this.presentToast('Error de conexion', 'danger')
      }
    }).finally(() => {
      this.hideLoading()
    })
  }

  // searchProductByCode() { //TODO

  //   let index = this.order.Lines.findIndex(x => x.ItemCode == this.search.toUpperCase())
  //   if (index >= 0) {
  //     if (this.order.Lines[index].LineStatus == 'O') {
  //       if (this.order.Lines[index].Detail.ManBtchNum == 'Y') {
  //         this.receptionService.setOrderData(this.order.Lines[index])
  //         this.presentToast('Ingresa Lote de Producto', 'warning')
  //         if (this.order.Lines[index].Detail.U_IL_TipPes == 'V') {
  //           this.router.navigate(['members/surtido-beef'])
  //         } else if (this.order.Lines[index].Detail.ManBtchNum == 'Y') {
  //           this.order.Lines[index].count = Number(this.ctd)
  //           this.router.navigate(['members/surtido-abarrotes-batch'])
  //         } else {
  //           this.router.navigate(['/members/surtido-abarrotes'])
  //         }

  //       } else {
  //         this.order.Lines[index].count = Number(this.ctd)
  //         this.order.Lines[index].pallet = ''
  //         this.presentToast('Se agrego a la lista', 'success')
  //       }
  //     } else {
  //       this.presentToast('Este producto ya se surtio completamente', 'warning')
  //     }
  //   } else {
  //     this.presentToast('Producto no se encontro en la lista', 'warning')
  //   }

  //   this.search = ''
  //   this.ctd = 0
  // }

  // searchProductByCb() { //TODO
  //   if (this.search == '') {

  //   } else {
  //     let index = this.order.Lines.findIndex(x => {
  //       let found = x.CodeBars.findIndex(y => y == this.search)
  //       if (found > -1) {
  //         return true
  //       } else {
  //         return false
  //       }
  //     })
  //     console.log(index)
  //     if (index >= 0) {
  //       if (Number(this.ctd) > Number(this.order.Lines[index].OpenQty)) {
  //         this.presentToast('Cantidad Excede el limite', 'warning')
  //       } else {
  //         if (this.order.Lines[index].LineStatus == 'O') {
  //           if (this.tarima == undefined || this.tarima == '') {
  //             this.presentToast('Ingresa tarima', 'warning')
  //           } else {
  //             if (this.order.Lines[index].Detail.ManBtchNum == 'Y') {

  //               this.receptionService.setOrderData(this.order.Lines[index])
  //               this.presentToast('Ingresa Lote de Producto', 'warning')
  //               if (this.order.Lines[index].Detail.U_IL_TipPes == 'V') {
  //                 this.router.navigate(['members/surtido-beef'])
  //               } else if (this.order.Lines[index].Detail.ManBtchNum == 'Y') {
  //                 this.order.Lines[index].count = Number(this.ctd)
  //                 this.order.Lines[index].pallet = this.tarima
  //                 this.router.navigate(['members/surtido-abarrotes-batch'])
  //               } else {
  //                 this.router.navigate(['/members/surtido-abarrotes'])
  //               }

  //             } else {
  //               this.order.Lines[index].count = Number(this.ctd)
  //               this.order.Lines[index].pallet = ''
  //               this.presentToast('Se agrego a la lista', 'success')
  //             }
  //           }
  //         } else {
  //           this.presentToast('Este producto ya se surtio completamente', 'warning')
  //         }
  //       }

  //     } else {
  //       this.presentToast('Producto no se encontro en la lista', 'warning')
  //     }
  //   }

  //   document.getElementById('input-codigo').setAttribute('value', '')

  // }


  goToProduct(index) {

    this.receptionService.setOrderData(this.order.Lines[index])

    if (this.order.Lines[index].U_IL_TipPes == 'V') {
      this.router.navigate(['members/surtido-beef'])
    } else if (this.order.Lines[index].ManBtchNum == 'Y') {
      this.router.navigate(['members/surtido-abarrotes-batch'])
    } else {
      this.router.navigate(['/members/surtido-abarrotes'])
    }
  }

  async sendProducts() {

    await this.presentLoading('Enviando....')

    const DeliveryRowDetailList = this.products.map(product => {
      return {
        LineNum: product.LineNum,
        DeliveryRowDetailList: (product.DeliveryRowDetailList) ? product.DeliveryRowDetailList : []
      };
    });

    console.log(DeliveryRowDetailList)

    if (DeliveryRowDetailList.length != 0) {
      const recepcionData = {
        DocEntry: this.order.DocEntry,
        DeliveryRows: DeliveryRowDetailList
      };
      this.http.post(this.apiSAP + '/api/Delivery/SAP', recepcionData).toPromise().then((data: any) => {
        console.log(data);
        this.presentToast('Surtido Concluido', 'success');
        this.order = undefined;
        this.number = undefined;
        this.products = [];
      }).catch(error => {
        console.log(error)
        this.presentToast(error, 'danger')
      }).finally(() => {
        this.hideLoading()
      });
    } else {
      this.presentToast('No hay productos que surtir', 'warning')
      this.hideLoading()
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
