import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { SettingsService } from '../../services/settings.service';
import { Platform } from '@ionic/angular';
import { ToastController, LoadingController } from '@ionic/angular';
import * as moment from 'moment';

@Component({
  selector: 'app-scann-inventory',
  templateUrl: './scann-inventory.page.html',
  styleUrls: ['./scann-inventory.page.scss'],
})
export class ScannInventoryPage implements OnInit {

  order: any
  load
  number
  codigoBarra
  lote
  peso
  sucursal
  detail = []
  cantidad: number
  cajasEscaneadas: number = 0
  fechaProd: Date
  searchType
  search
  total
  uom
  data
  apiSAP: string;


  constructor(private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,
    private platform: Platform,
    private settings: SettingsService) { }

  ngOnInit() {

    if (this.platform.is("cordova")) {
      this.data = this.settings.fileData
      this.sucursal = this.data.sucursal
      this.apiSAP = this.data.apiSAP
    } else {
      this.apiSAP = environment.apiSAP
      this.sucursal = "S01"
    }
  }

  async getOrdenByCode() {

    await this.presentLoading('Buscando....')

    this.http.get(this.apiSAP + '/api/products/detail/' + this.number.toUpperCase()).toPromise().then((prod: any) => {
      this.order = prod
      this.http.get(environment.apiWMS + '/codebardescriptionsVariants/' + this.order.detail.ItemCode).toPromise().then((codeBars: any) => {
        if (codeBars.length != 0) {
          this.order.cbDetail = codeBars
        } else {
          this.order.cbDetail = []
        }
      })
      console.log(this.order)
    }).catch((error) => {
      console.log(error)
      this.presentToast('Error al buscar producto', 'danger')
    }).finally(() => {
      this.hideLoading()
    })
  }


  calculateTotal() {
    this.total = Number(this.uom.BaseQty * this.cantidad)
  }

  async searchProductByCb() {

    if (this.search == '' || this.search == undefined) {

    } else {

      await this.presentLoading('Buscando....')

      this.http.get(this.apiSAP + '/api/codebar/' + this.search).toPromise().then((prod: any) => {
        this.order = prod
        this.http.get(environment.apiWMS + '/codebardescriptionsVariants/' + this.order.Detail.ItemCode).toPromise().then((codeBars: any) => {
          if (codeBars.length != 0) {
            this.order.cbDetail = codeBars
          } else {
            this.order.cbDetail = []
          }
        })
        console.log(this.order)
      }).catch((error) => {
        this.presentToast('Error al buscar producto', 'danger')
        console.log(error)
      }).finally(() => {
        this.hideLoading()
      })
    }


    this.search = ''
  }

  sendPesoFijo() {

    if (this.sucursal == undefined || this.sucursal == '') {
      this.presentToast('Faltan llenar campos', 'warning')
    } else {

      let scanned = {
        ItemCode: this.order.detail.ItemCode,
        Sucursal: this.sucursal,
        Product: this.order.detail.ItemName,
        Name: 'SI',
        visual: '',
        codigoBarra: '',
        Cantidad: this.cantidad,
        UM: this.uom.UomCode,
        CantidadBase: Number(this.uom.BaseQty * this.cantidad),
        UMBase: this.uom.BASEUOM,
        Fecha: '',
        Attr1: 'SI'
      }

      this.http.post(environment.apiWMS + '/Inventory/SAP', scanned).toPromise().then((resp: any) => {
        console.log(resp)
        this.presentToast('Guardado Correctamente', 'success')
        this.router.navigate(['/members/home'])
      }).catch(error => {
        console.log(error)
        this.presentToast('Error al guardar. Intenta de Nuevo', 'danger')
      })

      console.log(scanned)
    }

  }
  getData() {
    if (this.sucursal == undefined || this.sucursal == '') {
      this.presentToast('Faltan llenar campos', 'warning')
    } else {
      if (this.codigoBarra == '') {

      } else {
        if (this.order.cbDetail[0].grupo == 'queso') {
          let datos = {
            codigo: this.codigoBarra.trim()
          }
          this.http.post(environment.apiWMS + '/validateCodeBarInventorySAP2', datos).toPromise().then((data) => {
            if (data) {
              this.presentToast('Ya existe este codigo. Intenta de nuevo.', 'warning')
            } else {
              let codFound = this.order.cbDetail.findIndex(y => y.length == this.codigoBarra.trim().length)
              if (codFound < 0) {
                this.presentToast('El codigo de barra no coincide con la informacion de etiqueta de proveedor.', 'warning')
              } else {

                let peso = this.codigoBarra.substr(this.order.cbDetail[codFound].peso_pos - 1, this.order.cbDetail[codFound].peso_length)


                if (this.order.cbDetail[codFound].maneja_decimal == 1) {
                  if (this.order.cbDetail[codFound].UOM_id != 3) {
                    this.peso = Number((Number(peso) / 2.2046).toFixed(2))
                  } else {
                    this.peso = peso
                  }
                } else {
                  let contCero: number = 0
                  for (var i = 0; i < peso.length; i++) {
                    if (peso[i] == '0') {
                      contCero++
                    } else {
                      break
                    }
                  }
                  console.log('Cantidad de Ceros:' + contCero)
                  if (this.order.cbDetail[codFound].UOM_id != 3) {
                    if (contCero == 3) {
                      peso = peso.substring(0, peso.length - 1) + '.' + peso.substring(peso.length - 1, peso.length + 1)
                    } else if (contCero == 4) {
                      peso = peso.substring(peso.length - 2)
                    } else {
                      peso = peso.substring(0, peso.length - 2) + '.' + peso.substring(peso.length - 2, peso.length + 1)
                    }

                    console.log('Peso:' + peso)
                    if (peso != '.') {

                      this.peso = Number((Number(peso) / 2.2046).toFixed(2))
                      console.log(this.peso)
                    } else {

                      peso = 0
                    }
                  } else {
                    peso = peso.substring(0, peso.length - 2) + '.' + peso.substring(peso.length - 2, peso.length + 1)

                    console.log('Peso:' + peso)
                    if (peso != '.') {

                      this.peso = Number(Number(peso).toFixed(2))

                    } else {

                      peso = 0

                    }
                  }
                }

                // let fechaExp

                // let date = moment(fecha_prod, 'yyyymmdd').toString()
                // this.fechaProd = new Date(date)
                // fechaExp = this.fechaProd.getFullYear() + '' + (this.fechaProd.getMonth() + 1) + '' + this.fechaProd.getDay()
                // console.log('Fecha:' + fechaExp)
                let scanned

                if (this.codigoBarra.trim().length <= 36) {
                  scanned = {
                    ItemCode: this.order.detail.ItemCode,
                    Sucursal: this.sucursal,
                    Product: this.order.detail.ItemName,
                    Name: this.codigoBarra.trim(),
                    visual: this.codigoBarra.substr(this.codigoBarra.length - 14).trim(),
                    codigoBarra: this.codigoBarra.trim(),
                    Cantidad: 1,
                    UM: "CAJA",
                    CantidadBase: this.peso,
                    UMBase: this.order.uom[0].BASEUOM,
                    Fecha: '',
                    Attr1: 'SI'
                  }
                  this.cajasEscaneadas++
                } else {
                  scanned = {
                    ItemCode: this.order.detail.ItemCode,
                    Sucursal: this.sucursal,
                    Product: this.order.detail.ItemName,
                    Name: this.codigoBarra.substr(this.codigoBarra.length - 36).trim(),
                    visual: this.codigoBarra.substr(this.codigoBarra.length - 14).trim(),
                    codigoBarra: this.codigoBarra.trim(),
                    Cantidad: 1,
                    UM: "CAJA",
                    CantidadBase: this.peso,
                    UMBase: this.order.uom[0].BASEUOM,
                    Fecha: '',
                    Attr1: 'SI'
                  }
                  this.cajasEscaneadas++
                }

                this.detail.push(scanned)


                console.log(scanned)
                this.http.post(environment.apiWMS + '/Inventory/SAP', scanned).toPromise().then((resp: any) => {
                  console.log(resp)
                  this.presentToast('Guardado Correctamente', 'success')
                }).catch(error => {
                  console.log(error)
                  this.presentToast('Error al guardar. Intenta de Nuevo', 'danger')
                })

              }
            }
          })
        } else {
          this.http.get(environment.apiWMS + '/validateCodeBarInventorySAP/' + this.codigoBarra.trim()).toPromise().then((data) => {
            if (data) {
              this.presentToast('Ya existe este codigo. Intenta de nuevo.', 'warning')
            } else {
              let codFound = this.order.cbDetail.findIndex(y => y.length == this.codigoBarra.trim().length)
              if (codFound < 0) {
                this.presentToast('El codigo de barra no coincide con la informacion de etiqueta de proveedor.', 'warning')
              } else {

                let peso = this.codigoBarra.substr(this.order.cbDetail[codFound].peso_pos - 1, this.order.cbDetail[codFound].peso_length)


                if (this.order.cbDetail[codFound].maneja_decimal == 1) {
                  if (this.order.cbDetail[codFound].UOM_id != 3) {
                    this.peso = Number((Number(peso) / 2.2046).toFixed(2))
                  } else {
                    this.peso = peso
                  }
                } else {
                  let contCero: number = 0
                  for (var i = 0; i < peso.length; i++) {
                    if (peso[i] == '0') {
                      contCero++
                    } else {
                      break
                    }
                  }
                  console.log('Cantidad de Ceros:' + contCero)
                  if (this.order.cbDetail[codFound].UOM_id != 3) {
                    if (contCero == 3) {
                      peso = peso.substring(0, peso.length - 1) + '.' + peso.substring(peso.length - 1, peso.length + 1)
                    } else if (contCero == 4) {
                      peso = peso.substring(peso.length - 2)
                    } else {
                      peso = peso.substring(0, peso.length - 2) + '.' + peso.substring(peso.length - 2, peso.length + 1)
                    }

                    console.log('Peso:' + peso)
                    if (peso != '.') {

                      this.peso = Number((Number(peso) / 2.2046).toFixed(2))
                      console.log(this.peso)
                    } else {

                      peso = 0
                    }
                  } else {
                    peso = peso.substring(0, peso.length - 2) + '.' + peso.substring(peso.length - 2, peso.length + 1)

                    console.log('Peso:' + peso)
                    if (peso != '.') {

                      this.peso = Number(Number(peso).toFixed(2))

                    } else {

                      peso = 0

                    }
                  }
                }

                // let fechaExp

                // let date = moment(fecha_prod, 'yyyymmdd').toString()
                // this.fechaProd = new Date(date)
                // fechaExp = this.fechaProd.getFullYear() + '' + (this.fechaProd.getMonth() + 1) + '' + this.fechaProd.getDay()
                // console.log('Fecha:' + fechaExp)
                let scanned

                if (this.codigoBarra.length <= 36) {
                  scanned = {
                    ItemCode: this.order.detail.ItemCode,
                    Sucursal: this.sucursal,
                    Product: this.order.detail.ItemName,
                    Name: this.codigoBarra.trim(),
                    visual: this.codigoBarra.substr(this.codigoBarra.length - 14).trim(),
                    codigoBarra: this.codigoBarra.trim(),
                    Cantidad: 1,
                    UM: "CAJA",
                    CantidadBase: this.peso,
                    UMBase: this.order.uom[0].BASEUOM,
                    Fecha: '',
                    Attr1: 'SI'
                  }
                  this.cajasEscaneadas++
                } else {
                  scanned = {
                    ItemCode: this.order.detail.ItemCode,
                    Sucursal: this.sucursal,
                    Product: this.order.detail.ItemName,
                    Name: this.codigoBarra.substr(this.codigoBarra.length - 36).trim(),
                    visual: this.codigoBarra.substr(this.codigoBarra.length - 14).trim(),
                    codigoBarra: this.codigoBarra.trim(),
                    Cantidad: 1,
                    UM: "CAJA",
                    CantidadBase: this.peso,
                    UMBase: this.order.uom[0].BASEUOM,
                    Fecha: '',
                    Attr1: 'SI'
                  }
                  this.cajasEscaneadas++
                }

                this.detail.push(scanned)


                console.log(scanned)
                this.http.post(environment.apiWMS + '/Inventory/SAP', scanned).toPromise().then((resp: any) => {
                  console.log(resp)
                  this.presentToast('Guardado Correctamente', 'success')
                }).catch(error => {
                  console.log(error)
                  this.presentToast('Error al guardar. Intenta de Nuevo', 'danger')
                })

              }
            }
          })
        }


      }
    }


    document.getElementById('input-codigo').setAttribute('value', '')
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
