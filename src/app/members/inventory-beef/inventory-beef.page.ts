import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-inventory-beef',
  templateUrl: './inventory-beef.page.html',
  styleUrls: ['./inventory-beef.page.scss'],
})
export class InventoryBeefPage implements OnInit {

  //product data
  productData: any;
  codigoBarra: any;
  lote: any;
  load;
  peso: any
  isDesc: boolean

  constructor(
    private http: HttpClient,
    private barcodeScanner: BarcodeScanner,
    private navExtras: NavExtrasService,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,
    private storage: Storage,
    private alert: AlertController
  ) { }

  ngOnInit() {
    this.productData = this.navExtras.getInventoryProduct()

    if (!this.productData.detalle) this.productData.detalle = []

    this.http.get(environment.apiWMS + '/codebardescriptionsVariants/' + this.productData.codigo_prothevs).toPromise().then((desc: any) => {
      console.log(desc)
      if (desc.length == 0) {
        this.isDesc = false
        this.presentDialog()
      } else {
        this.isDesc = true
        this.productData.codeBarDesc = desc
      }
    })

    console.log(this.productData)
  }

  addOnChange(event) {

    if (event.target.value == '') {

    } else {
      if (!this.isDesc) {
        if (this.peso != undefined) {
          this.http.get(environment.apiWMS + '/validateCodeBarInventory/' + this.codigoBarra + '/' + this.productData.MovimientoInventario_id).toPromise().then((data) => {
            let encuentra = this.productData.detalle.findIndex(y => y.codigodebarras == this.codigoBarra)
            if (data || encuentra >= 0) {
              this.presentToast('Este codigo ya fue escaneado', 'warning')
            } else {
              this.productData.cantidad_contada = Number(this.productData.cantidad_contada) + 1
              this.productData.cantidad_diferencia = this.productData.cantidad_contada - this.productData.cantidad_teorica
              this.productData.lote = this.lote
              this.productData.cantidad_contada_lbs = Number(this.peso) + Number(this.productData.cantidad_contada_lbs)
              this.productData.cantidad_diferencia_lbs = this.productData.cantidad_teorica_lbs - this.productData.cantidad_contada_lbs

              this.productData.detalle.push({
                MovimientoInventarioDetalle_id: this.productData.MovimientoInventario_id,
                producto_id: this.productData.producto_id,
                codigo_prothevs: this.productData.codigo_prothevs,
                codigodebarras: this.codigoBarra,
                lote_id: this.lote,
                cantidad: 1,
                cantidad_lbs: this.peso
              }).catch((error) => {
                console.log(error)
                this.presentToast('Error al validar codigo de barra','warning')
              })
            }
          })

        } else {
          this.presentToast('Ingresa  peso primero e intenta de nuevo', 'warning')
        }

      } else {
        console.log(this.codigoBarra)
        this.http.get(environment.apiWMS + '/validateCodeBarInventory/' + this.codigoBarra + '/' + this.productData.MovimientoInventario_id).toPromise().then((data) => {
          let encuentra = this.productData.detalle.findIndex(y => y.codigodebarras == this.codigoBarra)
          if (data || encuentra >= 0) {
            this.presentToast('Este codigo ya fue escaneado', 'warning')
          } else {
            let size = this.productData.codeBarDesc.findIndex(y => y.length == this.codigoBarra.trim().length)
            if (size < 0) {
              this.presentToast('El codigo de barra no coincide con la informacion de etiqueta de proveedor.', 'warning')
            } else {
              let peso = this.codigoBarra.substr(this.productData.codeBarDesc[size].peso_pos - 1, this.productData.codeBarDesc[size].peso_length)
              if (this.productData.codeBarDesc[size].UOM_id != 3) {
                peso = peso.substring(0, peso.length - 1) + '.' + peso.substring(peso.length - 1, peso.length + 1)
                if (peso != '.') {
                  this.peso = Number((Number(peso) / 2.205).toFixed(2))
                  console.log(peso)
                  console.log(this.peso)
                } else {
                  peso = 0
                }
              } else {
                peso = peso.substring(0, peso.length - 2) + '.' + peso.substring(peso.length - 2, peso.length + 1)
                if (peso != '.') {
                  this.peso = Number(Number(peso).toFixed(2))
                } else {
                  peso = 0
                }
              }

              this.productData.cantidad_contada = Number(this.productData.cantidad_contada) + 1
              this.productData.cantidad_diferencia = this.productData.cantidad_contada - this.productData.cantidad_teorica
              this.productData.lote = this.lote
              this.productData.cantidad_contada_lbs = Number(this.peso) + Number(this.productData.cantidad_contada_lbs)
              this.productData.cantidad_diferencia_lbs = this.productData.cantidad_teorica_lbs - this.productData.cantidad_contada_lbs

              this.productData.detalle.push({
                MovimientoInventarioDetalle_id: this.productData.MovimientoInventario_id,
                producto_id: this.productData.producto_id,
                codigo_prothevs: this.productData.codigo_prothevs,
                codigodebarras: this.codigoBarra,
                lote_id: this.lote,
                cantidad: 1,
                cantidad_lbs: this.peso
              })
            }
          }
        }).catch((error) => {
          console.log(error)
          this.presentToast('Error al validar codigo de barra.', 'danger')
        })


      }

    }

    document.getElementById('input-codigo').setAttribute('value', '')

  }


  inventarirarProducts() {
    this.navExtras.setScannedProducts(this.productData)
    this.router.navigate(['/members/inventory-order-detail'])
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      position: "bottom",
      color: color,
      duration: 3000
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

  async presentDialog() {
    const alert = await this.alert.create({
      header: 'Warning.',
      message: 'Codigo de barra de proveedor no esta registrada. Contactar al administrador.',
      buttons: [
        {
          text: 'Aceptar',
          // handler: () => {

          // }
        }
      ]
    });

    await alert.present();
  }

}
