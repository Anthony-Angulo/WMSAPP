import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { Platform } from '@ionic/angular';
import { SettingsService } from './../../services/settings.service';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-transferencia-sap',
  templateUrl: './transferencia-sap.page.html',
  styleUrls: ['./transferencia-sap.page.scss'],
})
export class TransferenciaSapPage implements OnInit {

  load;
  order;
  search;
  number;
  searchType;
  ctd
  products = []
  tarima
  data
  apiSAP: any;

  constructor(
    private http: HttpClient,
    private barcodeScanner: BarcodeScanner,
    private receptionService: RecepcionDataService,
    private toastController: ToastController,
    private router: Router,
    private platform: Platform,
    private settings: SettingsService,
    private loading: LoadingController,
    private storage: Storage
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

    console.log(productsScanned)

    if (productsScanned != null) {
      if (productsScanned.count <= 0) {
        let ind = this.products.findIndex(product => product.ItemCode == productsScanned.ItemCode)
        this.products.splice(ind, 1)
      } else {
        let index = this.order.WTQ1.findIndex(product => product.ItemCode == productsScanned.ItemCode)
        this.order.WTQ1[index].count = productsScanned.count
        this.products.push(productsScanned)
      }
    }

    console.log(this.products)
    this.receptionService.setReceptionData(null)

  }

  async getOrden() {
    await this.presentLoading('Buscando....')
    this.http.get(this.apiSAP + '/api/inventorytransferrequest/reception/' + this.number).toPromise().then((data: any) => {
      this.order = data;
      console.log(this.order)
      let validOrder = this.order.WTQ1.findIndex(x => x.FromWhsCod == this.order.OWTQ.Filler && x.WhsCode == this.order.OWTQ.ToWhsCode)
      console.log(validOrder)
      if (validOrder >= 0) {
        this.presentToast('Orden de transferencia mal creada. Revisar almacenes de salida y destino.', 'warning')
        this.order = ''
      } else {
        return this.order.WTQ1.map(x => x.ItemCode)
      }
    }).then((codes) => {
      console.log(codes)
      return this.http.get(environment.apiWMS + '/codebardescriptionsVariants/' + codes).toPromise()
    }).then((codebarDescription: any[]) => {
      console.log(codebarDescription)

      if (codebarDescription) {
        this.order.WTQ1.map(item => {
          item.detalle_codigo = codebarDescription.filter(y => y.codigo_sap == item.ItemCode)
        })
      }
    }).catch(error => {
      console.log(error)
      if (error.status == 404) {
        this.presentToast('No encontrado o no existe', 'warning')
      } else if (error.status == 400) {
        this.presentToast(error.error, 'warning')
      } else if (error.status == 500) {
        this.presentToast('Error de conexion', 'danger')
      }
    }).finally(() => {
      this.hideLoading()
    })
  }

  searchProductByCode() {

    let index = this.order.WTQ1.findIndex(x => x.ItemCode == this.search.toUpperCase())
    if (index >= 0) {
      if (this.order.WTQ1[index].LineStatus == 'O') {
        this.receptionService.setOrderData(this.order.WTQ1[index])
        if (this.order.WTQ1[index].Detail.U_IL_TipPes == 'V') {
          this.router.navigate(['members/transferencia-beef'])
        } else if (this.order.WTQ1[index].Detail.ManBtchNum == 'Y') {
          this.router.navigate(['members/transferencia-abarrotes-batch'])
        } else {
          this.router.navigate(['/members/transferencia-abarrotes'])
        }

      } else {
        this.presentToast('Este producto ya se surtio completamente', 'warning')
      }
    } else {
      this.presentToast('Producto no se encontro en la lista', 'warning')
    }

    this.search = ''
  }

  searchProductByCb() {
    if (this.search == '') {

    } else {


      let index = this.order.WTQ1.findIndex(x => {
        let found = x.CodeBars.findIndex(y => y.BcdCode == this.search)
        if (found > -1) {
          return true
        } else {
          return false
        }
      })
      if (index >= 0) {
        if (Number(this.ctd) > Number(this.order.WTQ1[index].OpenQty)) {
          this.presentToast('Cantidad Excede el limite', 'warning')
        } else {
          if (this.order.WTQ1[index].LineStatus == 'O') {
            if (this.tarima == undefined || this.tarima == '') {
              this.presentToast('Ingresa tarima', 'warning')
            } else {
              if (this.order.WTQ1[index].Detail.ManBtchNum == 'Y') {
                this.receptionService.setOrderData(this.order.WTQ1[index])
                this.presentToast('Ingresa Lote de Producto', 'warning')
                if (this.order.WTQ1[index].Detail.U_IL_TipPes == 'V') {
                  this.router.navigate(['members/transferencia-beef'])
                } else if (this.order.WTQ1[index].Detail.ManBtchNum == 'Y') {
                  this.order.WTQ1[index].count = this.ctd
                  this.order.WTQ1[index].pallet = this.tarima
                  this.router.navigate(['members/transferencia-abarrotes-batch'])
                } else {
                  this.router.navigate(['/members/transferencia-abarrotes'])
                }
              } else {
                this.order.WTQ1[index].count = Number(this.ctd)
                this.order.WTQ1[index].pallet = this.tarima
                this.presentToast('Se agrego a la lista', 'success')
              }
            }

          } else {
            this.presentToast('Este producto ya se surtio completamente', 'warning')
          }
        }

      } else {
        this.presentToast('Producto no se encontro en la lista', 'warning')
      }
    }

    this.ctd = ''
    document.getElementById('input-codigo').setAttribute('value', '')

  }

  goToProduct(index) {

    this.receptionService.setOrderData(this.order.WTQ1[index])

    if (this.order.WTQ1[index].Detail.U_IL_TipPes == 'V') {
      this.router.navigate(['members/transferencia-beef'])
    } else if (this.order.WTQ1[index].Detail.ManBtchNum == 'Y') {
      this.router.navigate(['members/transferencia-abarrotes-batch'])
    } else {
      this.router.navigate(['/members/transferencia-abarrotes'])
    }
  }

  async sendProducts() {

    await this.presentLoading('Enviando....')

    const products = this.order.WTQ1.filter(product => product.count).map(product => {
      return {
        ItemCode: product.ItemCode,
        UoMEntry: product.UomEntry,
        WarehouseCode: product.WhsCode,
        Line: product.LineNum,
        Count: product.count,
        Pallet: product.pallet,
        Batch: (product.detalle) ? product.detalle : []
      };
    });

    if (products.length != 0) {
      const recepcionData = {
        order: this.order.OWTQ.DocEntry,
        products
      };
      this.http.post(this.apiSAP + '/api/inventorytransfer', recepcionData).toPromise().then((data: any) => {
        console.log(data);
        this.presentToast('Recepcion Concluida', 'success');
        this.order = undefined;
        this.number = undefined;
      }).catch(error => {
        console.log(error)
        this.presentToast(error.error.error, 'danger')
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
