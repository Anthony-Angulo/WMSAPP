import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { TarimasModalPage } from '../tarimas-modal/tarimas-modal.page';


@Component({
  selector: 'app-scannproducts',
  templateUrl: './scannproducts.page.html',
  styleUrls: ['./scannproducts.page.scss'],
})

export class ScannproductsPage implements OnInit {

  productData: any;
  codigoBarra: any = '';
  cantidad: number;
  cantidadTemp: number = 0;
  scannedProducts: any = [];
  productTable: any = [];
  productsToDelete: any = [];
  lote: string = '';
  modo: any;
  eventCodeBar: any;

  constructor(
    private http: HttpClient,
    private navExtras: NavExtrasService,
    private toastController: ToastController,
    private router: Router,
    private modalController: ModalController,
    private alert: AlertController) { }

  ngOnInit() {

    this.productData = this.navExtras.getOrderData();
    console.log(this.productData)
    if (this.productData.tipo != 3) {
      this.codigoBarra = this.productData.codbarSB;
    }

    if (!this.productData.detalle) this.productData.detalle = []
    if (!this.productData.tarimas) this.productData.tarimas = []

    this.navExtras.setOrderData(null)
  }

  ngOnDestroy() {
    if (this.productData.tarimas.length == 0) {
      delete this.productData.tarimas
    }
  }

  public scannOnChange(event) {

    this.eventCodeBar = event.target.value

    if (this.lote == '') {
      this.lote = null
    }

    if (this.eventCodeBar != '') {
      let index = this.productData.detalle.findIndex(product => product.codigobarras == this.eventCodeBar);
      if (index < 0) {
        this.productData.detalle.push({
          orden_compra: this.productData.num,
          codigo_protehus: this.productData.codigo_prothevs,
          cantidad: 1,
          codigobarras: this.codigoBarra,
          lote: this.lote,
          sucursal_id: 1,
          fecha_produccion: null,
          peso: 0,
          peso_lbs: 0,
          codigobarras_master: null
        });
      } else {
        this.productData.detalle[index].cantidad = Number(this.productData.detalle[index].cantidad)
        this.productData.detalle[index].cantidad += 1;
      }

      this.eventCodeBar = ''
      event.target.value = ''

    }
  }

  public scannProduct() {
    if (this.lote == '') {
      this.lote = null
    }
    if (this.codigoBarra != '' && this.cantidad != 0) {
      let index = this.productData.detalle.findIndex(product => product.codigobarras == this.codigoBarra);
      if (index < 0) {
        this.productData.detalle.push({
          orden_compra: this.productData.num,
          codigo_protehus: this.productData.codigo_prothevs,
          cantidad: this.cantidad,
          codigobarras: this.codigoBarra,
          lote: this.lote,
          sucursal_id: 1,
          fecha_produccion: null,
          peso: 0,
          peso_lbs: 0,
          codigobarras_master: null
        });
      } else {
        if (this.productData.detalle[index].id != undefined) {
          this.productsToDelete.push(this.productData.detalle[index].id)
          delete this.productData.detalle[index].id
        }
        this.productData.detalle[index].cantidad = Number(this.productData.detalle[index].cantidad)
        this.productData.detalle[index].cantidad = Number(this.cantidad);
      }
      this.codigoBarra = '';
      this.cantidad = 0;

    } else {
      this.presentToast("Ingresa primero un codigo y/o cantidad", 'warning');
    }
  }

  public eliminarRegistro(index) {
    console.log(this.productData.detalle[index])
    if (this.productData.detalle[index].codigobarras_master) {

      let body = {
        tarima_master: this.productData.detalle[index].codigobarras_master
      }

      this.http.post(environment.apiWMS + '/deleteTarima', body).toPromise().then((data: any) => {
        if (data.success) {
          let detalle_len = this.productData.detalle.length
          this.productData.tarimas = this.productData.tarimas.filter(product => product.codigo_master != this.productData.detalle[index].codigobarras_master)
          if (this.productData.detalle[index].id != undefined) {

            let productosborrar = this.productData.detalle.filter(product => product.codigobarras_master == this.productData.detalle[index].codigobarras_master)

            productosborrar.forEach(element => {

              this.http.delete(environment.apiWMS + '/deleteProductScanned/' + element.id).toPromise().then((data: any) => {
                console.log(data)
              })
            })
          }

          this.productData.detalle = this.productData.detalle.filter(product => product.codigobarras_master != this.productData.detalle[index].codigobarras_master)
        }
      }).catch(error => {
        console.log(error)
      }).finally()

    } else {
      if (this.productData.detalle[index].id != undefined) {
        console.log(this.productData.detalle[index].id)
        this.http.delete(environment.apiWMS + '/deleteProductScanned/' + this.productData.detalle[index].id).toPromise()
          .then((data: any) => {
          })
      }
      this.productData.detalle.splice(index, 1);
    }
  }

  public eliminarRegistroTarima(index) {

    let body = {
      tarima_master: this.productData.tarimas[index].codigo_master
    }

    this.http.post(environment.apiWMS + '/deleteTarima', body).toPromise().then(val => {
      console.log(val);
      this.productData.tarimas.splice(index, 1);
    }).catch(error => {
      this.presentToast('Error al eliminar tarima. Vuelva a Intentarlo', 'danger')
    });


  }

  public receptionProducts() {

    let cantidadVal = 0;
    this.productData.count = 0;

    if (this.productData.detalle.length != 0) {
      this.productData.detalle.forEach(element => {
        this.productData.count += Number(element.cantidad);
      });
    }

    this.productData.tarimas.forEach(element => {
      cantidadVal += element.cantidad;
    });

    if (this.productData.count >= cantidadVal) {
      this.productData.idsToDelete = this.productsToDelete
      this.navExtras.setScannedProducts(this.productData);

      this.router.navigate(['/members/recepcion']);
    } else {
      this.presentToast('Cantidad Maxima en tarimas excedida', 'warning')
    }

  }

  async openModal() {
    const modal = await this.modalController.create({
      component: TarimasModalPage,
      componentProps: {
        "data": this.productData,
      }
    });

    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        this.productData = dataReturned.data.productData
        console.log(this.productData)
      }
    });

    return await modal.present();
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      color: color,
      duration: 2000
    });
    toast.present();
  }

  async presentDialog(index) {
    const alert = await this.alert.create({
      header: 'Confirmar Borrado',
      message: 'Al borrar producto se eliminara tarima(s) y/o producto(s) que esten relacionados a el.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          }
        }, {
          text: 'Okay',
          handler: () => {
            this.eliminarRegistro(index)
          }
        }
      ]
    });

    await alert.present();
  }
}


