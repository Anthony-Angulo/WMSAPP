import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-recepcion-beef',
  templateUrl: './recepcion-beef.page.html',
  styleUrls: ['./recepcion-beef.page.scss'],
})
export class RecepcionBeefPage implements OnInit {

  productData: any;
  start: boolean = true;
  codigoBarra: any;
  fechaProd: Date = new Date();
  lote: any;
  peso: number;
  index: any = []
  tarimas = {
    products: []
  }


  constructor(
    private http: HttpClient,
    private navExtras: NavExtrasService,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,
    private alert: AlertController) { }

  ngOnInit() {
    this.productData = this.navExtras.getOrderData()
    console.log(this.productData)

    if (!this.productData.detalle) this.productData.detalle = [];
    if (!this.productData.tarimas) this.productData.tarimas = []

  }

  startTarima() {
    this.start = false
  }

  endTarima() {

    if (this.tarimas.products.length != 0) {

      this.presentLoading('Creando Tarima...')

      this.http.post(environment.apiWMS + '/saveTarima', this.tarimas).toPromise().then((data: any) => {

        this.index.forEach(index => {
          this.productData.detalle[index].codigobarras_master = data.codigo_master
        })

        this.productData.tarimas.push({
          codigo_master: data.codigo_master,
          cantidad: this.index.length
        })

        this.index = []
        this.tarimas.products = []

        this.start = true

        this.presentToast('Se Creo Tarima Satisfactoriamente', 'success')

      }).catch(error => {

        console.error(error)
        this.presentToast('Error al crear tarima', 'danger')

      }).finally(() => {
        this.hideLoading()
      })
    } else {
      this.presentToast('Debe ingresar al menos un producto para terminar tarima', 'warning')

    }

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

  public eliminarRegistro(index) {

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
          let detalle_len_new = this.productData.detalle.length
          if (!this.start) {
            this.index = this.index.map(x => x - detalle_len + detalle_len_new)
          }
        }
      }).catch(error => {
        console.log(error)
      }).finally()
    } else {
      if (!this.start) {

        let i = this.index.findIndex(i => i == index)
        if (i < 0) {

          this.index = this.index.map(x => x - 1)
          this.productData.detalle.splice(index, 1);

        } else {

          this.tarimas.products = this.tarimas.products.filter(product => product.codigoBarras != this.productData.detalle[index].codigobarras)
          this.productData.detalle.splice(index, 1)
          this.index.pop()

        }
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

    this.presentToast('Se borraron productos y/o tarimas', 'success')
  }


  public eliminarRegistroTarima(index) {

    let body = {
      tarima_master: this.productData.tarimas[index].codigo_master
    }

    this.http.post(environment.apiWMS + '/deleteTarima', body).toPromise().then(val => {
      console.log(val);
      this.productData.tarimas.splice(index, 1)
      this.productData.detalle = this.productData.detalle.filter(product => product.codigo_master != body.tarima_master)
    }).catch(error => {
      console.error(error)
    });

  }

  receptionProduct() {

    if (this.productData.detalle.length == 0) {
      delete this.productData.detalle
      delete this.productData.count
    } else {
      this.productData.count = 0;
      this.productData.detalle.forEach(element => {
        this.productData.count += element.cantidad;
      });
    }

    console.log(this.productData)
    this.navExtras.setScannedProducts(this.productData)
    this.router.navigate(['/members/recepcion'])
  }

  getData() {

    if (this.productData.detalle.findIndex(product => product.codigobarras == this.codigoBarra) != -1) {
      console.log(this.codigoBarra)
      this.presentToast('ya existe este codigo', 'warning')
      this.codigoBarra = ""
    } else if (this.codigoBarra != '') {
      let peso = this.codigoBarra.substr(this.productData.detalle_codigo.peso_pos - 1, this.productData.detalle_codigo.peso_length)
      let fecha_cad = this.codigoBarra.substr(this.productData.detalle_codigo.fecha_cad_pos - 1, this.productData.detalle_codigo.fecha_cad_length)
      let serie = this.codigoBarra.substr(this.productData.detalle_codigo.numero_serie_pos - 1, this.productData.detalle_codigo.numero_serie_length)
      let gtin = this.codigoBarra.substr(this.productData.detalle_codigo.gtin_pos - 1, this.productData.detalle_codigo.gtin_length)
      let sku = this.codigoBarra.substr(this.productData.detalle_codigo.sku_pos - 1, this.productData.detalle_codigo.sku_length)
      let fecha_prod = this.codigoBarra.substr(this.productData.detalle_codigo.fecha_prod_pos - 1, this.productData.detalle_codigo.fecha_prod_length)

      console.log('peso: ' + peso + '  fecha_cad:  ' + fecha_cad + '  serie: ' + serie + '  gtin: ' + gtin + '  sku: ' + sku + '  fecha_prod: ' + fecha_prod)

      if (this.productData.detalle_codigo.UOM_id != 3) {
        peso = peso.substring(0, peso.length - 1) + '.' + peso.substring(peso.length - 1, peso.length + 1)
        if (peso != '.') {
          this.peso = Number((Number(peso) / 2.205).toFixed(2))
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

      if (fecha_prod != undefined || fecha_prod != '') {
        console.log(fecha_prod)
        this.fechaProd = fecha_prod
      }

      if (peso == 0 && (this.peso == undefined || this.peso <= 0)) {
        this.presentToast('Debes ingrear peso de producto.', 'warning')
        return
      }

      if (fecha_prod == '' && this.fechaProd == undefined) {
        this.presentToast('Debes ingresar fecha de produccion.', 'warning')
        return
      }

      if (this.lote == '' || this.lote == undefined) {
        this.presentToast('Debes ingresar lote.', 'warning')
        return
      }

      if (!this.start) {

        this.index.push(this.productData.detalle.length)

        this.tarimas.products.push({
          codigoProtevs: this.productData.codigoProtevs,
          cantidad: 1,
          UM_mayoreo: this.productData.unidad_medida,
          lote: this.lote,
          fecha_produccion: this.fechaProd,
          codigoBarras: this.codigoBarra
        })
      }

      this.productData.detalle.push({
        orden_compra: this.productData.num,
        codigo_protehus: this.productData.codigo_prothevs,
        cantidad: 1,
        codigobarras: this.codigoBarra,
        lote: this.lote,
        sucursal_id: 1,
        fecha_produccion: this.fechaProd,
        peso: this.peso,
        peso_lbs: peso,
        codigobarras_master: null
      })
      this.presentToast('Se agrego a la lista', 'success')

      this.fechaProd = null
      this.peso = 0
    }

    this.codigoBarra = ''

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

  async presentLoading(msg: string) {
    const loading = await this.loading.create({
      message: msg,
    });

    await loading.present()
  }

  hideLoading() {
    this.loading.dismiss();
  }
}
