import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { temporaryAllocator } from '@angular/compiler/src/render3/view/util';

const SUCURSAL_KEY = '0';
const USER_ID = '1';

@Component({
  selector: 'app-full-inventory',
  templateUrl: './full-inventory.page.html',
  styleUrls: ['./full-inventory.page.scss'],
})
export class FullInventoryPage implements OnInit {

  codigoProtevs: any
  codigoBarra: any
  productInfo: any
  modo: any
  lote: number = 0;
  load: any;
  cantidad: number
  boxExist: boolean = true
  done: boolean = false
  carne: boolean = true
  envProd: any = []
  peso: any
  isDesc: boolean
  movId: any;

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
    this.movId = this.navExtras.getMovInv()
  }

  findProduct() {
    if (this.codigoProtevs != undefined) {
      this.http.get(environment.apiWMS + '/findProduct/' + this.codigoProtevs + '/' + this.movId).toPromise().then((res) => {
        this.productInfo = res;
        if (this.productInfo.product_type_id == 3) {
          this.carne = false
          if (!this.productInfo.detalle) this.productInfo.detalle = []
          this.http.get(environment.apiWMS + '/codebardescriptionsVariants/' + this.productInfo.codigo_prothevs).toPromise().then((desc: any) => {
            console.log(desc)
            if (desc.length == 0) {
              this.isDesc = false
              this.presentDialog()
            } else {
              this.isDesc = true
              this.productInfo.codeBarDesc = desc
            }
          })
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

    console.log(this.productInfo)

  }

  // addProduct() {
  //   if (this.cantidad != 0 && this.cantidad != undefined) {
  //     this.productInfo.cantidad_contada = this.cantidad
  //     this.productInfo.cantidad_diferencia = this.cantidad - this.productInfo.cantidad_teorica
  //     this.productInfo.lote = this.lote
  //   } else {
  //     this.presentToast('Ingresa primero una cantidad y/o lote.', 'warning')
  //   }
  //   console.log(this.productInfo)
  //   this.lote = ''
  // }

  addOnChange(event) {
    console.log(event.target.value.trim().length)
    if (event.target.value == '') {

    } else {
      this.http.get(environment.apiWMS + '/validateCodeBarInventory/' + this.codigoBarra +'/'+ this.productInfo.MovimientoInventario_id).toPromise().then((data) => {
        let encontrado = this.productInfo.detalle.findIndex(y => y.codigodebarras == this.codigoBarra)
        if(data || encontrado >= 0){
          this.presentToast('El codigo de barra ya fue escaneado','warning')
        }else{
          if(this.lote != 0){
            if (!this.isDesc) {
              this.productInfo.cantidad_contada = Number(this.productInfo.cantidad_contada) + 1
              this.productInfo.cantidad_contada_lbs = Number(this.peso) + Number(this.productInfo.cantidad_contada_lbs)
              this.productInfo.lote = this.lote
      
              this.productInfo.detalle.push({
                MovimientoInventarioDetalle_id: this.productInfo.MovimientoInventario_id,
                producto_id: this.productInfo.producto_id,
                codigo_prothevs: this.productInfo.codigo_prothevs,
                codigodebarras: this.codigoBarra,
                lote_id: this.lote,
                cantidad: 1,
                cantidad_lbs: this.peso
              })
            } else {
              let index = this.productInfo.codeBarDesc.findIndex(y => y.length == this.codigoBarra.trim().length)
              console.log(this.productInfo.codeBarDesc[index])
              if (index < 0) {
                this.presentToast('El codigo de barra no coincide con la informacion de etiqueta de proveedor.', 'warning')
              } else {
                let peso = this.codigoBarra.substr(this.productInfo.codeBarDesc[index].peso_pos - 1, this.productInfo.codeBarDesc[index].peso_length)
                if (this.productInfo.codeBarDesc[index].UOM_id != 3) {
                  peso = peso.substring(0, peso.length - 1) + '.' + peso.substring(peso.length - 1, peso.length + 1)
                  if (peso != '.') {
                    this.peso = Number((Number(peso) / 2.205).toFixed(2))
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
      
                this.productInfo.cantidad_contada = Number(this.productInfo.cantidad_contada) + 1
                this.productInfo.lote = this.lote
                this.productInfo.cantidad_contada_lbs = Number(this.peso) + Number(this.productInfo.cantidad_contada_lbs)
      
                this.productInfo.detalle.push({
                  MovimientoInventarioDetalle_id: this.productInfo.MovimientoInventario_id,
                  producto_id: this.productInfo.producto_id,
                  codigo_prothevs: this.productInfo.codigo_prothevs,
                  codigodebarras: this.codigoBarra,
                  lote_id: this.lote,
                  cantidad: 1,
                  cantidad_lbs: this.peso
                })
      
              }
            }
          }else{
            this.presentToast('Debe ingresar lote','warning')
          }
        }
      })
        
      
      
      


      console.log(this.productInfo)
      console.log(this.productInfo.detalle)
      document.getElementById('input-codigo').setAttribute('value', '')
    }

  }

  inventariarProducts() {

    this.presentLoading('Enviando Inventario...')

    if (this.productInfo.product_type_id == 3) {
      this.storage.get(SUCURSAL_KEY).then(sucursal => {
        this.storage.get(USER_ID).then(userId => {
          this.envProd.push({
            MovimientoInventario_id: this.productInfo.MovimientoInventario_id,
            sucursal_id: sucursal,
            producto_id: this.productInfo.producto_id,
            user_id: userId,
            codigo_prothevs: this.productInfo.codigo_prothevs,
            lote_id: this.lote,
            descripcion: this.productInfo.descripcion,
            cantidad_contada: this.productInfo.cantidad_contada,
            cantidad_contada_lbs: this.productInfo.cantidad_contada_lbs,
          })

          Promise.all([
            this.http.post(environment.apiWMS + '/addInventoryTemp', this.envProd).toPromise(),
            this.http.post(environment.apiWMS + '/codigoDeBarraInventario', this.productInfo.detalle).toPromise()
          ]).then(() => {
            this.presentToast('Se guardo correctamente.', 'success')
            this.router.navigate(['/members/home'])
          }).catch(() => {
            this.presentToast('Error al finalizar inventario. Intenta de nuevo', 'danger')
          }).finally(() => {
            this.hideLoading()
          })
        })
      })

    } else {
      this.storage.get(SUCURSAL_KEY).then(sucursal => {
        this.storage.get(USER_ID).then(userId => {
          this.envProd.push({
            MovimientoInventario_id: this.productInfo.MovimientoInventario_id,
            sucursal_id: sucursal,
            producto_id: this.productInfo.producto_id,
            user_id: userId,
            codigo_prothevs: this.productInfo.codigo_prothevs,
            lote_id: this.lote,
            descripcion: this.productInfo.descripcion,
            cantidad_contada: this.cantidad,
            cantidad_contada_lbs: 0,
          })

          Promise.all([
            this.http.post(environment.apiWMS + '/addInventoryTemp', this.envProd).toPromise(),
            this.http.post(environment.apiWMS + '/codigoDeBarraInventario', this.productInfo.detalle).toPromise()
          ]).then(() => {
            this.presentToast('Se guardo correctamente.', 'success')
            this.router.navigate(['/members/home'])
          }).catch(() => {
            this.presentToast('Error al finalizar inventario. Intenta de nuevo', 'danger')
          }).finally(() => {
            this.hideLoading()
          })
        })

      })

    }


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
