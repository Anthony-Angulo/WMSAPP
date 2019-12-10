import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
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
  products = []
  search;

  constructor(
    private http: HttpClient,
    private barcodeScanner: BarcodeScanner,
    private receptionService: RecepcionDataService,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,
    private storage: Storage
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {

    let productsScanned = this.receptionService.getReceptionData()

    console.log(productsScanned)

    if (productsScanned != null) {
      if (productsScanned.count <= 0) {
        let ind = this.products.findIndex(product => product.ItemCode == productsScanned.ItemCode)
        this.products.splice(ind, 1)
      } else {
        let index = this.order.RDR1.findIndex(product => product.ItemCode == productsScanned.ItemCode)
        this.order.RDR1[index].count = productsScanned.count
        this.products.push(productsScanned)
      }
    }

    console.log(this.products)

    this.receptionService.setReceptionData(null)
  }

  async getOrden() {
    await this.presentLoading('Buscando....')
    this.http.get(environment.apiSAP + '/api/order/delivery/' + this.number).toPromise().then((data: any) => {
      this.order = data;
      console.log(this.order)
      return this.order.RDR1.map(x => x.ItemCode)
    }).then((codes) => {
      console.log(codes)
      return this.http.get(environment.apiWMS + '/codebardescriptionsVariants/' + codes).toPromise()
    }).then((codebarDescription: any[]) => {
      console.log(codebarDescription)
      this.order.RDR1.map(item => {
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

  searchProduct() {


    let index = this.order.RDR1.findIndex(x => x.ItemCode == this.search.toUpperCase())
    if (this.order.RDR1[index].LineStatus == 'O') {
      if (index < 0) {
        this.presentToast('Producto no se encontro en la lista', 'warning')
      } else {
        this.receptionService.setOrderData(this.order.RDR1[index])

        if (this.order.RDR1[index].Detail.U_IL_TipPes == 'V' || this.order.RDR1[index].Detail.QryGroup41 == 'Y') {
          this.router.navigate(['members/surtido-beef'])
        } else if (this.order.RDR1[index].Detail.ManBtchNum == 'Y') {
          this.router.navigate(['members/surtido-abarrotes-batch'])
        } else {
          this.router.navigate(['/members/surtido-abarrotes'])
        }
      }
    } else {
      this.presentToast('Este producto ya se surtio completamente','warning')
    }

  }

  goToProduct(index) {

    this.receptionService.setOrderData(this.order.RDR1[index])

    if (this.order.RDR1[index].Detail.U_IL_TipPes == 'V' || this.order.RDR1[index].Detail.QryGroup41 == 'Y') {
      this.router.navigate(['members/surtido-beef'])
    } else if (this.order.RDR1[index].Detail.ManBtchNum == 'Y') {
      this.router.navigate(['members/surtido-abarrotes-batch'])
    } else {
      this.router.navigate(['/members/surtido-abarrotes'])
    }
  }

  async sendProducts() {

    await this.presentLoading('Enviando....')

    const products = this.order.RDR1.filter(product => product.count).map(product => {
      return {
        ItemCode: product.ItemCode,
        UoMEntry: product.UomEntry,
        WarehouseCode: product.WhsCode,
        Line: product.LineNum,
        Count: product.count,
        Batch: (product.detalle) ? product.detalle : []
      };
    });

    if (products.length != 0) {
      const recepcionData = {
        order: this.order.ORDR.DocEntry,
        products
      };
      this.http.post(environment.apiSAP + '/api/Delivery', recepcionData).toPromise().then((data: any) => {
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
