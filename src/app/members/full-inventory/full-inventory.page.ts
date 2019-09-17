import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-full-inventory',
  templateUrl: './full-inventory.page.html',
  styleUrls: ['./full-inventory.page.scss'],
})
export class FullInventoryPage implements OnInit {

  codigoProtevs: any
  productInfo: any
  modo: any
  lote: any = 0;
  load: any;
  cantidad: number
  boxExist: boolean = true
  done: boolean = false
  carne: boolean = true

  constructor(
    private http: HttpClient,
    private barcodeScanner: BarcodeScanner,
    private navExtras: NavExtrasService,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,
    private storage: Storage
  ) { }

  ngOnInit() { }

  findProduct() {
    if (this.codigoProtevs != undefined) {
      this.http.get(environment.apiWMS + '/findProduct/' + this.codigoProtevs).toPromise().then((res) => {
        this.productInfo = res;
        if (this.productInfo.product_type_id == 3) {
          this.carne = false
          if (!this.productInfo.detalle) this.productInfo.detalle = []
        } else {
          if (this.productInfo.Barcode == null) {
            this.boxExist = false
          } else {
            this.boxExist = true
          }
        }
        if (this.productInfo.status == 1) {
          this.done = true
        } else {
          this.done = false
        }
        console.log(this.productInfo)
      }).catch((error) => {
        console.log(error)
        this.presentToast('Error al buscar producto. Intente de nuevo.', 'danger')
      })
    } else {
      this.presentToast('Debes ingresar un codigo primero.', 'warning')
    }
  }

  addProduct() {
    if (this.cantidad != 0 && this.cantidad != undefined) {
      this.productInfo.cantidad_contada = this.cantidad
      this.productInfo.cantidad_diferencia = this.cantidad - this.productInfo.cantidad_teorica
      this.productInfo.lote = this.lote
    } else {
      this.presentToast('Ingresa primero una cantidad y/o lote.', 'warning')
    }
    console.log(this.productInfo)
    this.lote = ''
  }

  addOnChange(event) {
    if (event.target.value == '') {

    } else {
      this.productInfo.cantidad_contada = Number(this.productInfo.cantidad_contada) + 1
      this.productInfo.cantidad_diferencia = this.productInfo.cantidad_contada - this.productInfo.cantidad_teorica
      this.productInfo.lote = this.lote

      this.productInfo.detalle.push({
        MovimientoInventarioDetalle_id: this.productInfo.MovimientoInventario_id,
        producto_id: this.productInfo.producto_id,
        codigo_prothevs: this.productInfo.codigo_prothevs,
        codigodebarras: event.target.value,
        lote_id: this.lote
      })

      console.log(this.productInfo)
      console.log(this.productInfo.detalle)
      document.getElementById('input-codigo').setAttribute('value', '')
    }

  }

  inventariarProducts() {
    let envProd = []

    envProd.push({
      id: this.productInfo.id,
      cantidad_contada: this.productInfo.cantidad_contada,
      cantidad_diferencia: this.productInfo.cantidad_diferencia,
      lote_id: this.productInfo.lote
    })

    Promise.all([
      this.http.post(environment.apiWMS + '/updateInventoryDetail', envProd).toPromise(),
      this.http.post(environment.apiWMS + '/codigoDeBarraInventario', this.productInfo.detalle).toPromise()
    ]).then(() => {
      this.presentToast('Se guardo correctamente.', 'success')
      this.router.navigate(['/members/home'])
    }).catch(() => {
      this.presentToast('Error al finalizar inventario. Intenta de nuevo', 'danger')
    })
  }

  closeInventory() {
    let idFinished = []

    idFinished.push({
      id: this.productInfo.id
    })

    this.http.post(environment.apiWMS + '/updateDetailStatus', idFinished).toPromise().then((resp) => {
      this.presentToast('Se cerro correctamente.', 'success')
      this.router.navigate(['/members/home'])
    }).catch(() => {
      this.presentToast('Error al cerrar inventario. Intente de nuevo.', 'danger')
    })
  }

  async presentLoading(msg: string) {
    this.load = await this.loading.create({
      message: msg,
      duration: 3000
    });

    await this.load.present()
  }

  public hideLoading() {
    this.load.dismiss()
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

}
