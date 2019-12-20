import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
// import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-recepcion-sap',
  templateUrl: './recepcion-sap.page.html',
  styleUrls: ['./recepcion-sap.page.scss'],
})
export class RecepcionSapPage implements OnInit {

  order: any;
  number: number;
  load: any;
  products: any = []

  constructor(
    private http: HttpClient,
    private barcodeScanner: BarcodeScanner,
    // private navExtras: NavExtrasService,
    private receptionService: RecepcionDataService,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,
    private storage: Storage
  ) { }

  ngOnInit() { }

  ionViewWillEnter() {

    let productsScanned = this.receptionService.getReceptionData()

    console.log(productsScanned)

    if (productsScanned != null) {
      if (productsScanned.count <= 0) {
        let ind = this.products.findIndex(product => product.ItemCode == productsScanned.ItemCode)
        this.products.splice(ind, 1)
      } else {
        let index = this.order.POR1.findIndex(product => product.ItemCode == productsScanned.ItemCode)
        this.order.POR1[index].count = productsScanned.count
        this.products.push(productsScanned)
      }
    }

    console.log(this.products)
    this.receptionService.setReceptionData(null)
  }

  async getOrden() {
    await this.presentLoading('Buscando....')
    this.http.get(environment.apiSAP + '/api/purchaseorder/Reception/' + this.number).toPromise().then((data: any) => {
      this.order = data;
      console.log(this.order)
      return this.order.POR1.map(x => x.ItemCode)
    }).then((codes) => {
      console.log(codes)
      return this.http.get(environment.apiWMS + '/codebardescriptionsVariants/' + codes).toPromise()
    }).then((codebarDescription: any[]) => {
      console.log(codebarDescription)
      this.order.POR1.map(item => {
        item.detalle_codigo = codebarDescription.filter(y => y.codigo_sap == item.ItemCode)
      })
    }).catch(error => {
      console.log(error)
      if (error.status == 404) {
        this.presentToast('No encontrado o no existe', 'warning')
      } else if (error.status == 400) {
        this.presentToast(error.error, 'warning')
      } else {
        this.presentToast('Error de conexion', 'danger')
      }
    }).finally(() => {
      this.hideLoading()
    })
  }

  goToProduct(index) {

    this.receptionService.setOrderData(this.order.POR1[index])

    if (this.order.POR1[index].Detail.U_IL_TipPes == 'V') {
      this.router.navigate(['members/beef'])
    } else if (this.order.POR1[index].Detail.ManBtchNum == 'Y') {
      this.router.navigate(['members/abarrotes-batch'])
    } else {
      this.router.navigate(['/members/abarrotes'])
    }
  }

  async sendProducts() {

    await this.presentLoading('Enviando....')

    const products = this.order.POR1.filter(product => product.count).map(product => {
      return {
        ItemCode: product.ItemCode,
        UoMEntry: product.UomEntry,
        WarehouseCode: product.WhsCode,
        Line: product.LineNum,
        Count: product.count,
        ItemType: product.Detail.U_IL_TipPes,
        Batch: (product.detalle) ? product.detalle : []
      }
    })

    if (products.length != 0) {
      const recepcionData = {
        order: this.order.OPOR.DocEntry,
        products
      }
      this.http.post(environment.apiSAP + '/api/PurchaseDelivery', recepcionData).toPromise().then((data: any) => {
        console.log(data);
        this.presentToast('Recepcion Concluida', 'success');
        this.order = undefined;
        this.number = undefined;
      }).catch(error => {
        console.log(error)
        this.presentToast(error.error.error, 'danger')
      }).finally(() => {
        this.hideLoading()
      })
    } else {
      this.presentToast('No hay productos que recibir.', 'warning')
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


