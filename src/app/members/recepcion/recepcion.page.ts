import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { ToastController, LoadingController } from '@ionic/angular';

const SUCURSAL_KEY = '0';

@Component({
  selector: 'app-recepcion',
  templateUrl: './recepcion.page.html',
  styleUrls: ['./recepcion.page.scss'],
})
export class RecepcionPage implements OnInit {

  number: number;

  order: any;

  orderData: any;
  scannedProductList: any = [];
  scannedBeefList: any = [];
  total_orden: number = 0;
  codigoCaja: any;
  load: any;


  constructor(
    private http: HttpClient,
    private barcodeScanner: BarcodeScanner,
    private navExtras: NavExtrasService,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,
    private storage: Storage) { }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.navExtras.setOrderData(null)
    this.navExtras.setScannedProducts(null)
  }

  ionViewWillEnter() {

    let productsScanned = this.navExtras.getScannedProducts();

    console.log(productsScanned)

    if (productsScanned != null) {
      let index = this.order.detalle.findIndex(product => { return product.codigoProtevs == productsScanned.codigo_prothevs });

      if (index >= 0) {
        this.order.detalle[index] = productsScanned;
      }
    }

    this.navExtras.setScannedProducts(null);

  }

  public getOrden() {

    if (this.number == undefined) {
      this.presentToast('no numero ingresado', 'danger')
      return
    }
    this.presentLoading('Buscando...')

    let order
    this.storage.get(SUCURSAL_KEY).then(sucursal => {
      return Promise.all([
        this.http.get(environment.apiProtevs + '/api/ordenDeCompras/' + this.number + '/' + sucursal).toPromise(),
        this.http.get(environment.apiWMS + '/orderExist/' + this.number).toPromise()
      ])
    }).then(([orderData, dataExist]: any[]) => {
      order = orderData
      dataExist.order.map(x => x.cantidad = Number(x.cantidad))
      order.detalle.map(x => x.detalle = dataExist.order.filter(y => y.codigo_protehus == x.codigo_prothevs))
      order.detalle.map(x => x.count = x.detalle.map(y => y.cantidad).reduce((a, b) => a + b, 0))
      return orderData.detalle.map(a => a.codigo_prothevs)
    }).then(codes => {
      return Promise.all([
        this.http.get(environment.apiWMS + '/getLoteNeed/' + codes).toPromise(),
        this.http.get(environment.apiWMS + '/codebardescriptionsVariants/' + codes).toPromise(),
        this.http.get(environment.apiWMS +'/getBoxCodes/' + codes).toPromise()
      ])
    }).then(([needLote, codebarDescription, boxcodes]: any[]) => {
      order.detalle.map(product => {
        product.needLote = Number(needLote.find(y => y.codigoProtevs == product.codigo_prothevs).maneja_lote)
        product.detalle_codigo = codebarDescription.find(y => y.codigo_protevs == product.codigo_prothevs)
        product.codbarSB = boxcodes.find(y => y.itemNo == product.codigo_prothevs)
      })
      this.order = order
      console.log(this.order)
    }).catch(error => {
      this.presentToast('Error al buscar orden. Vuelva a Intentarlo', 'danger')
    }).finally(() => {
      this.hideLoading()
    })

  }

  goToProductOnChange(event) {

    if (event.target.value != '') {
      console.log(event.target.value)
      this.codigoCaja = event.target.value
      console.log(this.codigoCaja)
      let filtrada = this.order.detalle.filter(prod => prod.codbarSB != undefined)
      console.log(filtrada)
      let ind = filtrada.findIndex(product => product.codbarSB.Barcode == this.codigoCaja)
      console.log(ind)
      if (ind >= 0) {
        this.navExtras
          .setOrderData(filtrada[ind])
        if (this.order.detalle[ind].tipo == 3) {
          this.router.navigate(['members/recepcion-beef'])
        } else {
          this.router.navigate(['/members/scannproducts'])
        }
      } else {
        this.presentToast('No se encontro codigo de caja de producto en la lista o no tiene registrado un codigo de barra', 'warning')
      }
    }
    this.codigoCaja = ''
    event.target.value = ''

  }

  goToProduct(index: number) {

    this.navExtras
      .setOrderData(this.order.detalle[index])

    if (this.order.detalle[index].tipo == 3) {
      this.router.navigate(['members/recepcion-beef'])
    } else {
      this.router.navigate(['/members/scannproducts'])
    }

  }

  public recibirProductos() {

    this.presentLoading('Registrando...')

    let pro = [];
    let errors = 0

    this.order.detalle.forEach(product => {

      if (product.detalle) pro = pro.concat(product.detalle)

      if (product.tipo == 3) {

      } else {
        if (product.tarimas) {
          console.log(product)
          let count_tarima = product.tarimas.map(x => x.cantidad).reduce((a, b) => a + b, 0)
          if (count_tarima > product.count || product.count == undefined) {
            this.presentToast("Revisar Tarimas. Excede de la cantidad de producto escaneado.", "danger")
            errors++
          }
        }
      }
    });

    if (errors) return

    pro = pro.filter(products => products.id == undefined)

    if (pro.length != 0) {

      let enviar = {
        products: pro,
        idsToDelete: this.order.detalle.filter(product => product.idsToDelete).map(x => x.idsToDelete).flat()
      }

      console.log(enviar)
      this.http.post(environment.apiWMS + '/TempRecepcion', enviar).toPromise().then((response: any) => {

        if (response.success) {
          this.presentToast('Recepcion Satisfactoria.', "success");
          this.router.navigate(['/members/home']);
        }

      }).catch(error => {
        this.presentToast('Error: Revisar productos escaneados', 'danger')
      }).finally(() => {
        this.hideLoading()
      })

    } else {
      this.hideLoading()
      this.presentToast('No hay producto Registrado.', "danger");

    }
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      position: "bottom",
      color: color,
      duration: 2000
    });
    toast.present();
  }

  async presentLoading(msg) {
    this.load = await this.loading.create({
      message: msg,
      duration: 3000
    });

    await this.load.present()
  }

  hideLoading() {
    console.log('loading')
    this.load.dismiss()
  }
}
