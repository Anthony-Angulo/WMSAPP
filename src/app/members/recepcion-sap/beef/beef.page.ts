import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { SettingsService } from '../../../services/settings.service';
import { Platform } from '@ionic/angular';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { getCerosFromEtiqueta } from '../../commons';


@Component({
  selector: 'app-beef',
  templateUrl: './beef.page.html',
  styleUrls: ['./beef.page.scss'],
})
export class BeefPage implements OnInit {

  productData: any
  lotesRegistrados: any
  codigoBarra
  peso
  fechaProd: Date
  detail = []
  cantidadEscaneada: number = 0
  cantidadPeso: number = 0
  lote: any
  load
  data
  porcentaje: any;
  codebarDescription: any;
  inputs = [];
  selectedDesc: any;

  constructor(
    private http: HttpClient,
    private navExtras: NavExtrasService,
    private toastController: ToastController,
    private receptionService: RecepcionDataService,
    private router: Router,
    private platform: Platform,
    private settings: SettingsService,
    private loading: LoadingController,
    private alert: AlertController
  ) { }

  async ngOnInit() {
    this.productData = this.receptionService.getOrderData()
    this.lotesRegistrados = this.receptionService.getReceptionData()

    if (!this.productData.detalle) {
      this.productData.detalle = []
    } else {
      this.detail = this.productData.detalle
    }

    if (!this.productData.cajasEscaneadas) {
      this.productData.cajasEscaneadas = 0
    } else {
      this.cantidadEscaneada = this.productData.cajasEscaneadas
    }

    if (!this.productData.pesoContado) {
      this.productData.pesoContado = 0
    } else {
      this.cantidadPeso = this.productData.pesoContado
    }

    if (Number(this.productData.Detail.U_IL_PesMin) == 0 && Number(this.productData.Detail.U_IL_PesMax) == 0) {
      this.productData.Detail.U_IL_PesMin = 0
      this.productData.Detail.U_IL_PesMax = 100
    }

    await this.presentLoading('Buscando Lotes de producto...')

    this.http.get(environment.apiSAP + '/api/batch/' + this.productData.WhsCode + '/' + this.productData.ItemCode).toPromise().then((data) => {
      this.productData.batchs = data
      console.log(data)
    }).catch((error) => {
      console.log(error)
      this.presentToast(error.error.error, 'danger')
    }).finally(() => {
      this.hideLoading()
    })


    if (this.platform.is("cordova")) {
      this.data = this.settings.fileData
      this.porcentaje = this.data.porcentaje
    } else {
      this.porcentaje = "10"
    }

    if (this.productData.Detail.QryGroup45 == "Y") {
      this.codebarDescription = this.productData.cBDetail.filter(x => x.proveedor != null)
      this.codebarDescription.forEach(y => {
        this.inputs.push({
          name: y.proveedor,
          type: "radio",
          label: y.proveedor,
          value: y.proveedor
        })
      })

      this.promptCodeDesc()
      this.presentToast("Selecciona una configuracion", "warning")
    }
  }



  submit() {
    this.productData.cajasEscaneadas = this.cantidadEscaneada
    this.productData.pesoContado = this.cantidadPeso

    if (this.productData.count != 0 && this.cantidadEscaneada <= 0) {
      this.productData.count = this.cantidadEscaneada
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/recepcion-sap'])
    } else if (this.cantidadEscaneada <= 0) {
      this.presentToast('Debe igresar una cantidad valida', 'warning')
    } else if (this.productData.Detail.QryGroup41 == 'Y') {
      this.productData.count = this.cantidadEscaneada
      this.productData.detalle = this.detail
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/recepcion-sap'])
    } else {

      this.productData.count = this.detail.map(lote => lote.quantity).reduce((a, b) => a + b, 0)

      let validPercent = (Number(this.porcentaje) / 100) * Number(this.productData.OpenInvQty)
      let validQuantity = Number(validPercent) + Number(this.productData.OpenInvQty)

      if (this.productData.count > Number(validQuantity)) {
        this.presentToast('Cantidad Excede a la cantidad solicitada', 'warning')
      } else {
        this.productData.detalle = this.detail
        this.receptionService.setReceptionData(this.productData)
        this.router.navigate(['/members/recepcion-sap'])
      }
    }

  }

  eliminar(index) {
    this.cantidadEscaneada--
    this.cantidadPeso = this.cantidadPeso - Number(this.detail[index].quantity)
    this.detail.splice(index, 1)

  }


  async promptCodeDesc() {
    const alert = await this.alert.create({
      header: 'Configuracion',
      inputs: this.inputs,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Aceptar',
          handler: (data) => {
            this.selectedDesc = data
          }
        }
      ]
    });

    await alert.present();
  }



  public getDataFromCodeBar () : void {
    if (this.lote == undefined || this.lote == '') {
      this.presentToast('Debes ingresar lote primero', 'warning')
    } else {
      if (this.codigoBarra == '') {}
      else {
        if (this.productData.Detail.QryGroup44 == 'Y') {

          let codFound = this.productData.cBDetail.findIndex(y =>
            y.length == this.codigoBarra.trim().length)

          if (codFound < 0) {
            this.presentToast('El codigo de barra no coincide con la informacion'+
            ' de etiqueta de proveedor.', 'warning')
          } else {

            let pesoDeEtiqueta = this.codigoBarra.substr(
              this.productData.cBDetail[codFound].peso_pos - 1,
              this.productData.cBDetail[codFound].peso_length)

            if (this.productData.cBDetail[codFound].maneja_decimal == 1) {
              if (this.productData.cBDetail[codFound].UOM_id != 3) {
                this.peso = Number((Number(pesoDeEtiqueta) / 2.2046).toFixed(2))
              } else {
                this.peso = Number(pesoDeEtiqueta);
              }
            } else {
              this.peso = getCerosFromEtiqueta(this.productData,
                pesoDeEtiqueta,
                codFound);
            }

            if (Number(this.peso) >= Number(this.productData.Detail.U_IL_PesMin)
              && Number(this.peso) <= Number(this.productData.Detail.U_IL_PesMax)) {

              let ind = this.detail.findIndex(product => product.code
                == this.codigoBarra.trim())
              let codFoundInBatchs = this.productData.batchs.findIndex(y =>
                y.U_IL_CodBar == this.codigoBarra.trim())

              if (ind < 0 && codFoundInBatchs < 0) {
                if(this.productData.Detail.QryGroup2 == 'Y'){
                  let pedimento = this.navExtras.getPedimento()

                  if (pedimento == undefined) {
                    this.presentToast('Debes ingresar pedimento', 'warning')
                  } else {
                    this.detail.push({
                      name: this.codigoBarra.substr(25, this.codigoBarra.length).trim(),
                      code: this.codigoBarra.trim(),
                      attr1: this.lote,
                      expirationDate: '11-12-2019',
                      quantity: this.peso,
                      pedimento: pedimento
                    })
                    this.cantidadEscaneada++
                    this.cantidadPeso = this.cantidadPeso + Number(this.peso)
                    this.presentToast('Se agrego a la lista', 'success')
                  }
                } else {
                  this.detail.push({
                    name: this.codigoBarra.substr(25, this.codigoBarra.length).trim(),
                    code: this.codigoBarra.trim(),
                    attr1: this.lote,
                    expirationDate: '11-12-2019',
                    quantity: this.peso,
                    pedimento: ''
                  })
                  this.cantidadEscaneada++
                  this.cantidadPeso = this.cantidadPeso + Number(this.peso)
                  this.presentToast('Se agrego a la lista', 'success')
                }
              } else {
                this.presentToast('El codigo de barra ya fue escaneado', 'warning')
              }
            } else {
              this.presentToast('El peso no cumple con el peso promedio. ' +
                'Contactar a departamento de datos maestros', 'warning')
            }

            this.fechaProd = null
            this.peso = 0
          }
        } else if (this.productData.Detail.QryGroup45 == "Y") {

          let codFound = this.productData.cBDetail.findIndex(y =>
            y.proveedor == this.selectedDesc)
            console.log(codFound)
          if (codFound < 0) {
            this.presentToast('El codigo de barra no coincide con la ' +
              'informacion de etiqueta de proveedor. Seleccione otra configuracion',
              'warning')
          } else {

            let pesoDeEtiqueta = this.codigoBarra.substr(
              this.productData.cBDetail[codFound].peso_pos - 1,
              this.productData.cBDetail[codFound].peso_length)


            if (this.productData.cBDetail[codFound].maneja_decimal == 1) {
              if (this.productData.cBDetail[codFound].UOM_id != 3) {
                this.peso = Number((Number(pesoDeEtiqueta) / 2.2046).toFixed(2))
              } else {
                this.peso = Number(pesoDeEtiqueta);
              }
            } else {
              this.peso = getCerosFromEtiqueta(this.productData,
                pesoDeEtiqueta,
                codFound);
            }
            console.log(this.peso)
            console.log(this.selectedDesc)
            if (Number(this.peso) >= Number(this.productData.Detail.U_IL_PesMin)
              && Number(this.peso) <= Number(this.productData.Detail.U_IL_PesMax)) {
              if (this.codigoBarra.trim().length <= 36) {

                let ind = this.detail.findIndex(product => product.code == this.codigoBarra.trim())
                let codFoundInBatchs = this.productData.batchs.findIndex(y =>
                  y.U_IL_CodBar == this.codigoBarra.trim())

                if (ind < 0 && codFoundInBatchs < 0) {
                  if(this.productData.Detail.QryGroup2 == "Y"){
                    let pedimento = this.navExtras.getPedimento()

                    if (pedimento == undefined) {
                      this.presentToast('Debes agregar pedimento', 'warning')
                    } else {
                      this.detail.push({
                        name: this.codigoBarra.trim(),
                        code: this.codigoBarra.trim(),
                        attr1: this.lote,
                        expirationDate: '11-12-2019',
                        quantity: this.peso,
                        pedimento: pedimento
                      })
                      this.cantidadEscaneada++
                      this.cantidadPeso = this.cantidadPeso + Number(this.peso)
                      this.presentToast('Se agrego a la lista', 'success')
                    }
                  } else {
                    this.detail.push({
                      name: this.codigoBarra.trim(),
                      code: this.codigoBarra.trim(),
                      attr1: this.lote,
                      expirationDate: '11-12-2019',
                      quantity: this.peso,
                      pedimento: ''
                    })
                    this.cantidadEscaneada++
                    this.cantidadPeso = this.cantidadPeso + Number(this.peso)
                    this.presentToast('Se agrego a la lista', 'success')
                  }
                } else {
                  this.presentToast('El codigo de barra ya fue escaneado', 'warning')
                }
              } else {

                let ind = this.detail.findIndex(product => product.code
                  == this.codigoBarra.trim())
                let codFoundInBatchs = this.productData.batchs.findIndex(y =>
                  y.U_IL_CodBar == this.codigoBarra.trim())

                if (ind < 0 && codFoundInBatchs < 0) {
                  if(this.productData.Detail.QryGroup2 == "Y"){
                    let pedimento = this.navExtras.getPedimento()

                    if (pedimento == undefined) {
                      this.presentToast('Debes agregar pedimento', 'warning')
                    } else {
                      this.detail.push({
                        name: this.codigoBarra.substr(this.codigoBarra.length - 36),
                        code: this.codigoBarra.trim(),
                        attr1: this.lote,
                        expirationDate: '11-12-2019',
                        quantity: this.peso,
                        pedimento: pedimento
                      })
                      this.cantidadEscaneada++
                      this.cantidadPeso = this.cantidadPeso + Number(this.peso)
                      this.presentToast('Se agrego a la lista', 'success')
                    }
                  } else {
                    this.detail.push({
                      name: this.codigoBarra.substr(this.codigoBarra.length - 36),
                      code: this.codigoBarra.trim(),
                      attr1: this.lote,
                      expirationDate: '11-12-2019',
                      quantity: this.peso,
                      pedimento: ''
                    })
                    this.cantidadEscaneada++
                    this.cantidadPeso = this.cantidadPeso + Number(this.peso)
                    this.presentToast('Se agrego a la lista', 'success')
                  }
                } else {
                  this.presentToast('El codigo de barra ya fue escaneado', 'warning')
                }
              }
            } else {
              this.presentToast('El peso no cumple con el peso promedio. Contactar a departamento de datos maestros', 'warning')
            }
            this.fechaProd = null
            this.peso = 0
          }
        } else {
          let codFound = this.productData.cBDetail.findIndex(y =>
            y.length == this.codigoBarra.trim().length)

          if (codFound < 0) {
            this.presentToast('El codigo de barra no coincide con la ' +
              'informacion de etiqueta de proveedor.','warning')
          } else {

            let pesoDeEtiqueta = this.codigoBarra.substr(
              this.productData.cBDetail[codFound].peso_pos - 1,
              this.productData.cBDetail[codFound].peso_length)


            if (this.productData.cBDetail[codFound].maneja_decimal == 1) {
              if (this.productData.cBDetail[codFound].UOM_id != 3) {
                this.peso = Number((Number(pesoDeEtiqueta) / 2.2046).toFixed(2))
              } else {
                this.peso = Number(pesoDeEtiqueta);
              }
            } else {
              this.peso = getCerosFromEtiqueta(this.productData,
                pesoDeEtiqueta,
                codFound);
            }

            if (Number(this.peso) >= Number(this.productData.Detail.U_IL_PesMin)
              && Number(this.peso) <= Number(this.productData.Detail.U_IL_PesMax)) {
              if (this.codigoBarra.trim().length <= 36) {

                let ind = this.detail.findIndex(product => product.code == this.codigoBarra.trim())
                let codFoundInBatchs = this.productData.batchs.findIndex(y =>
                  y.U_IL_CodBar == this.codigoBarra.trim())

                if (ind < 0 && codFoundInBatchs < 0) {
                  if(this.productData.Detail.QryGroup2 == "Y"){
                    let pedimento = this.navExtras.getPedimento()

                    if (pedimento == undefined) {
                      this.presentToast('Debes agregar pedimento', 'warning')
                    } else {
                      this.detail.push({
                        name: this.codigoBarra.trim(),
                        code: this.codigoBarra.trim(),
                        attr1: this.lote,
                        expirationDate: '11-12-2019',
                        quantity: this.peso,
                        pedimento: pedimento
                      })
                      this.cantidadEscaneada++
                      this.cantidadPeso = this.cantidadPeso + Number(this.peso)
                      this.presentToast('Se agrego a la lista', 'success')
                    }
                  } else {
                    this.detail.push({
                      name: this.codigoBarra.trim(),
                      code: this.codigoBarra.trim(),
                      attr1: this.lote,
                      expirationDate: '11-12-2019',
                      quantity: this.peso,
                      pedimento: ''
                    })
                    this.cantidadEscaneada++
                    this.cantidadPeso = this.cantidadPeso + Number(this.peso)
                    this.presentToast('Se agrego a la lista', 'success')
                  }
                } else {
                  this.presentToast('El codigo de barra ya fue escaneado', 'warning')
                }
              } else {

                let ind = this.detail.findIndex(product => product.code
                  == this.codigoBarra.trim())
                let codFoundInBatchs = this.productData.batchs.findIndex(y =>
                  y.U_IL_CodBar == this.codigoBarra.trim())

                if (ind < 0 && codFoundInBatchs < 0) {
                  if(this.productData.Detail.QryGroup2 == "Y"){
                    let pedimento = this.navExtras.getPedimento()

                    if (pedimento == undefined) {
                      this.presentToast('Debes agregar pedimento', 'warning')
                    } else {
                      this.detail.push({
                        name: this.codigoBarra.substr(this.codigoBarra.length - 36),
                        code: this.codigoBarra.trim(),
                        attr1: this.lote,
                        expirationDate: '11-12-2019',
                        quantity: this.peso,
                        pedimento: pedimento
                      })
                      this.cantidadEscaneada++
                      this.cantidadPeso = this.cantidadPeso + Number(this.peso)
                      this.presentToast('Se agrego a la lista', 'success')
                    }
                  } else {
                    this.detail.push({
                      name: this.codigoBarra.substr(this.codigoBarra.length - 36),
                      code: this.codigoBarra.trim(),
                      attr1: this.lote,
                      expirationDate: '11-12-2019',
                      quantity: this.peso,
                      pedimento: ''
                    })
                    this.cantidadEscaneada++
                    this.cantidadPeso = this.cantidadPeso + Number(this.peso)
                    this.presentToast('Se agrego a la lista', 'success')
                  }
                } else {
                  this.presentToast('El codigo de barra ya fue escaneado', 'warning')
                }
              }
            } else {
              this.presentToast('El peso no cumple con el peso promedio. Contactar a departamento de datos maestros', 'warning')
            }
            this.fechaProd = null
            this.peso = 0
          }
        }
      }
    }


    document.getElementById('input-codigo').setAttribute('value', '')
    document.getElementById('input-codigo').focus()
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      position: "middle",
      color: color,
      duration: 2000
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
