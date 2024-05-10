import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SettingsService } from './../../services/settings.service';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { Platform } from '@ionic/angular';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { getSettingsFileData } from '../commons';
// import * as barCodeReader from 'src/assets/scripts/BarcodeParser.js'
declare var parseBarcode: any;

const TOKEN_KEY = 'auth-token';

@Component({
  selector: 'app-recepcion-sap',
  templateUrl: './recepcion-sap.page.html',
  styleUrls: ['./recepcion-sap.page.scss'],
})
export class RecepcionSapPage implements OnInit {

  public appSettings: any;

  order: any;
  public number: number;
  load: any;
  products: any = []
  crbarras: any = [];
  search
  ctd
  data: any
  apiSAP: any


  constructor(
    private http: HttpClient,
    private settings: SettingsService,
    private navExtras: NavExtrasService,
    private receptionService: RecepcionDataService,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,
    private alertController: AlertController,
    private platform: Platform,
    private storage: Storage
  ) { }

  ngOnInit() {
    this.appSettings = getSettingsFileData(this.platform, this.settings);
  }

  ionViewWillEnter() {

    let productsScanned = this.receptionService.getReceptionData();

    if (productsScanned == null) return

    if (productsScanned.count <= 0) {
      let ind = this.products.findIndex(product => product.ItemCode == productsScanned.ItemCode);

      if (ind >= 0) {
        this.products.splice(ind, 1);
      }

    } else {

      let index = this.order.POR1.findIndex(product => product.ItemCode == productsScanned.ItemCode);

      this.order.POR1[index].count = productsScanned.count;

      if(this.order.POR1[index].crBars) {
        for (let x = 0; x < this.order.POR1[index].crBars.length; x++) {
          let array = [this.order.POR1[index].crBars[x].ItemCode, this.order.POR1[index].crBars[x].Peso, this.order.POR1[index].crBars[x].CodeBar, this.order.POR1[index].crBars[x].FechaCaducidad, this.order.POR1[index].crBars[x].FechaProduccion]
          this.crbarras.push(array)
        }
      }
      this.products.push(productsScanned);
    }



    this.receptionService.setReceptionData(null)
  }

  async getOrden() {

    await this.presentLoading('Buscando Orden De Compra....');


    this.http.get(`${this.appSettings.apiSAP}/api/purchaseorder/Reception/${this.number}`).toPromise().then((data: any) => {
      this.crbarras = [];
      this.order = data;
      if (this.order.OPOR.U_IL_Pedimento != null) {
        this.navExtras.setPedimento(this.order.OPOR.U_IL_Pedimento)
      }
    }).catch(async error => {
      if (error.status == 404) {
        this.presentToast('No encontrado o no existe', 'warning')
      } else if (error.status == 400) {
        this.presentToast(error.error, 'warning')
      } else if (error.status == 401) {
        this.presentToast(error.error, "danger");
      } else {
        this.presentToast('Error de conexion', 'danger')
      }
    }).finally(() => {
      this.hideLoading();
    });

  }

  searchProductByCode() {

    let index = this.order.POR1.findIndex(x => x.ItemCode == this.search.toUpperCase())

    if (index >= 0) {
      if (this.order.POR1[index].LineStatus == 'O') {
        this.order.POR1[index].DocNum = this.number;
        this.receptionService.setOrderData(this.order.POR1[index])
        if (this.order.POR1[index].Detail.U_IL_TipPes == 'V') {
          this.router.navigate(['members/beef'])
        } else if (this.order.POR1[index].Detail.ManBtchNum == 'Y') {
          this.router.navigate(['members/abarrotes-batch'])
        } else {
          this.router.navigate(['/members/abarrotes'])
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

      let index = this.order.POR1.findIndex(x => {
        let found = x.CodeBars.findIndex(y => y.BcdCode == this.search.trim())
        if (found > -1) {
          return true
        } else {
          return false
        }
      })

      if (index >= 0) {
        if (Number(this.ctd) > Number(this.order.POR1[index].OpenQty)) {
          this.presentToast('Cantidad Excede el limite', 'warning')
        } else {
          if (this.order.POR1[index].LineStatus == 'O') {
            if (this.order.POR1[index].Detail.ManBtchNum == 'Y') {
              this.receptionService.setOrderData(this.order.POR1[index])
              this.presentToast('Ingresa Lote de Producto', 'warning')
              if (this.order.POR1[index].Detail.U_IL_TipPes == 'V') {
                this.router.navigate(['members/beef'])
              } else if (this.order.POR1[index].Detail.ManBtchNum == 'Y') {
                this.order.POR1[index].count = Number(this.ctd)
                this.router.navigate(['members/abarrotes-batch'])
              } else {
                this.router.navigate(['/members/abarrotes'])
              }
            } else {
              this.order.POR1[index].count = Number(this.ctd)
              this.presentToast('Se agrego a la lista', 'success')
            }

          } else {
            this.presentToast('Este producto ya se recibio completamente', 'warning')
          }
        }

      } else {
        this.presentToast('Producto no se encontro en la lista', 'warning')
      }
    }

    this.ctd = ''
    document.getElementById('input-codigo').setAttribute('value', '')
  }

  goToProduct(index:number) {
    this.order.POR1[index].DocNum = this.number;
    this.receptionService.setOrderData(this.order.POR1[index])
    if (this.order.POR1[index].Detail.ManBtchNum == 'Y') {
      this.router.navigate(['members/beef'])
    // } else if (this.order.POR1[index].Detail.U_IL_TipPes == 'F') {
    //   this.router.navigate(['members/abarrotes-batch'])
    } else {
      this.router.navigate(['/members/abarrotes'])
    }
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirmirmar salida',
      message: 'Desea continuar o salir de la recepcion?',
      buttons: [
        {
          text: 'Salir',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            this.presentToast('Recepcion Concluida', 'success');
            this.order = undefined;
            this.number = undefined;
            this.crbarras = [];
            this.navExtras.setPedimento(null)
          }
        }, {
          text: 'Continuar',
          handler: () => {
            this.getOrden();
          }
        }
      ]
    });

    await alert.present();
  }

  async sendProducts() {

    await this.presentLoading('Enviando....');


    const products = this.order.POR1.filter(product => product.count).map(product => {
      return {
        ItemCode: product.ItemCode,
        UoMCode: product.UomCode,
        UoMEntry: product.UomEntry,
        WarehouseCode: product.WhsCode,
        Line: product.LineNum,
        Count: product.count,
        ItemType: (product.Detail.U_IL_TipPes == null) ? 'F' : product.Detail.U_IL_TipPes,
        SupplierCode: product.SupplierCode,
        Group: (product.Detail.QryGroup43 == "Y") ? 43 : 0,
        Batch: (product.detalle) ? product.detalle : []
      }
    });


    console.log(this.crbarras);

    let pedimento

    if (this.navExtras.getPedimento() == undefined || this.navExtras.getPedimento() == null) {
      pedimento = ''
    } else {
      pedimento = this.navExtras.getPedimento()
    }

    this.createCrBars();
    

    if (products.length != 0) {
      const recepcionData = {
        order: this.order.OPOR.DocEntry,
        pedimento: pedimento,
        products
      }

      console.log(recepcionData)


      this.http.post(`${this.appSettings.apiSAP}/api/PurchaseDelivery`, recepcionData).toPromise().then((data: any) => {
        console.log(data);
        this.createCrBars();
        this.presentAlertConfirm();
      }).catch(error => {
        if (error.status == 401) {
          this.presentToast(error.error, 'danger');
        } else {
          this.presentToast(error.error, 'danger');
        }
      }).finally(() => {
        this.hideLoading()
      })
    } else {
      this.presentToast('No hay productos que recibir.', 'warning')
      this.hideLoading()
    }


  }

  async createCrBars() {
    await this.http.post(`${environment.apiCCFN}/crBar`, this.crbarras).toPromise()
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
