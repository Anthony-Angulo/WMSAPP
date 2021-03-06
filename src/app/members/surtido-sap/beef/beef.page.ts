import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { environment } from 'src/environments/environment';
import { SettingsService } from '../../../services/settings.service';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { getCerosFromEtiqueta } from '../../commons';
import * as moment from 'moment';

@Component({
  selector: 'app-beef',
  templateUrl: './beef.page.html',
  styleUrls: ['./beef.page.scss'],
})
export class BeefPage implements OnInit {

  productData: any
  codigoBarra: string
  peso
  detail = []
  cantidadEscaneada: number = 0
  cantidadPeso: number = 0
  lote: any
  batch: any
  load
  data
  porcentaje: string
  oldBatchList = []
  codebarDescription: any;
  inputs = [];
  selectedDesc: any;
  apiSap: string;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private receptionService: RecepcionDataService,
    private router: Router,
    private alert: AlertController,
    private loading: LoadingController,
    private platform: Platform,
    private settings: SettingsService
  ) { }

  async ngOnInit() {
    this.productData = this.receptionService.getOrderData()

    if (this.productData.DeliveryRowDetailList) {
      this.detail = this.productData.DeliveryRowDetailList[0].BatchList
      this.cantidadPeso = this.productData.DeliveryRowDetailList[0].Count
    }

    if (this.productData.cajasEscaneadas) {
      this.cantidadEscaneada = Number(this.productData.cajasEscaneadas)
    } else {
      this.cantidadEscaneada = 0
    }



    if (this.platform.is("cordova")) {
      this.data = this.settings.fileData
      this.porcentaje = this.data.porcentaje
      this.apiSap = this.data.apiSAP;
    } else {
      this.porcentaje = "10"
      this.apiSap = environment.apiSAP
    }

    if (!this.productData.pesoContado) {
      this.productData.pesoContado = 0
    } else {
      this.cantidadPeso = this.productData.pesoContado
    }

    if (Number(this.productData.U_IL_PesMin) == 0 && Number(this.productData.U_IL_PesMax) == 0) {
      this.productData.U_IL_PesMin = 0
      this.productData.U_IL_PesMax = 100
    }

    await this.presentLoading('Buscando Lotes de producto...')

    this.http.get(this.apiSap + '/api/batch/' + this.productData.WhsCode + '/' + this.productData.ItemCode).toPromise().then((data) => {
      console.log(data)
      this.batch = data
      this.oldBatchList = this.batch.filter(x => Number(x.CreateDate) < 20191218)
    }).catch((error) => {
      this.presentToast(error.error.error, 'danger')
    }).finally(() => {
      this.hideLoading()
    })

    if (this.productData.QryGroup45 == "Y") {
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

  public async promptLote(index: number) {
    const alertLote = await this.alert.create({
      header: 'Ingresa Cantidad A Surtir',
      inputs: [
        {
          name: 'cantidad',
          type: 'text',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Aceptar',
          handler: (data) => {
            if(Number(data.cantidad) > this.detail[index].Quantity)  {
              this.presentToast('Excede de la cantidad escaneada','warning')
              return
            }
            let dif = this.detail[index].Quantity - Number(data.cantidad)
            this.cantidadPeso = this.cantidadPeso - dif
            this.detail[index].Quantity = Number(data.cantidad)
          }
        }, {
          text: 'Eliminar',
          handler: () => {
            if (this.cantidadEscaneada != 0) {
              this.cantidadEscaneada--
              this.cantidadPeso = this.cantidadPeso - Number(this.detail[index].Quantity)
              this.detail.splice(index, 1)
            }
          }
        },

      ]});

      await alertLote.present();
  }

  submit() {

    if (this.detail.length == 0) {
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/surtido-sap'])
    }


    this.productData.cajasEscaneadas = this.cantidadEscaneada

    let BatchList = this.detail

    let detalle = [{
      BatchList,
      total: this.cantidadPeso,
      Count: this.cantidadPeso,
      UomEntry: this.productData.UomEntry
    }]

    this.productData.DeliveryRowDetailList = detalle
    console.log(this.productData)
    this.receptionService.setReceptionData(this.productData)
    this.router.navigate(['/members/surtido-sap'])
  }

  // eliminar(index) {
  //   if (this.cantidadEscaneada != 0) {
  //     this.cantidadEscaneada--
  //     this.cantidadPeso = this.cantidadPeso - Number(this.detail[index].quantity)
  //     this.detail.splice(index, 1)
  //   }
  // }



  public getDataFromCodeBar(): void {

    if (this.codigoBarra == '') { }
    else {
      if (this.productData.QryGroup44 == 'Y') {
        let codFound = this.productData.cBDetail.findIndex(y =>
          y.length == this.codigoBarra.trim().length)

        if (codFound < 0) {
          this.presentToast('El codigo de barra no coincide con la informacion' +
            'de etiqueta de proveedor.', 'warning')
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
          let ind = this.detail.findIndex(product =>
            product.cb == this.codigoBarra.trim()) //Verificar si el codigo de barra ya fue escaneado
          if (ind < 0) {
            if (Number(this.peso) >= Number(this.productData.U_IL_PesMin)
              && Number(this.peso) <= Number(this.productData.U_IL_PesMax)) {

              let findBatch = this.batch.findIndex(y => y.BatchNum
                == this.codigoBarra.substr(25, this.codigoBarra.length).trim())
              if (findBatch < 0) {
                let fin_ind_batch = this.oldBatchList.findIndex(x =>
                  Number(x.Quantity) == Number(this.peso))

                if (fin_ind_batch >= 0) {//Si encuentra un peso que coincide entrara a esta condicion

                  this.detail.push({
                    Code: this.oldBatchList[fin_ind_batch].BatchNum,
                    display: this.oldBatchList[fin_ind_batch].BatchNum
                      .substr(this.oldBatchList[fin_ind_batch].BatchNum.length - 6),
                    cb: this.codigoBarra,
                    attr1: this.lote,
                    expirationDate: '11-12-2019',
                    Quantity: Number(this.oldBatchList[fin_ind_batch].Quantity),
                    uom: this.productData.Uoms[0].BaseUom,
                  })

                  this.oldBatchList.splice(fin_ind_batch, 1)
                  this.cantidadEscaneada++
                  this.cantidadPeso = this.cantidadPeso + Number(this.peso)
                  this.presentToast('Se agrego a la lista', 'success')

                } else { //Si no encuentra un peso coincidente escogera el lote SI
                  let findLotes = this.batch.find(y => Number(y.Quantity) >= 50)
                  if (findLotes != undefined) {
                    this.detail.push({
                      Code: findLotes.BatchNum,
                      display: findLotes.BatchNum,
                      cb: this.codigoBarra,
                      attr1: this.lote,
                      expirationDate: '11-12-2019',
                      Quantity: Number(this.peso),
                      uom: this.productData.Uoms[0].BaseUom
                    })

                    this.cantidadEscaneada++
                    this.cantidadPeso = this.cantidadPeso + Number(this.peso)
                    this.presentToast('Se agrego a la lista', 'success')
                  } else { this.presentToast("El codigo de barra no se encontro", "warning") }
                }
              } else { //Si encuentra el lote en la lista original entrara en esta condicion

                this.detail.push({
                  Code: this.batch[findBatch].BatchNum,
                  display: this.batch[findBatch].BatchNum
                    .substr(this.batch[findBatch].BatchNum.length - 6),
                  cb: this.codigoBarra,
                  attr1: this.lote,
                  expirationDate: '11-12-2019',
                  Quantity: Number(this.batch[findBatch].Quantity),
                  uom: this.productData.Uoms[0].BaseUom
                })

                this.cantidadEscaneada++
                this.cantidadPeso = this.cantidadPeso + Number(this.peso)
                this.presentToast('Se agrego a la lista', 'success')

              }
            } else {
              this.presentToast('El peso sobrepasa el peso promedio. ' +
                'Contactar al departamento de datos maestros.', 'warning')
            }

          } else {
            this.presentToast('El codigo de barra ya fue escaneado', 'warning')
          }
        }
      } else if (this.productData.QryGroup45 == "Y") {
        console.log('propiedad45')
        let ind = this.detail.findIndex(product =>
          product.cb == this.codigoBarra.trim())
        if (ind < 0) {
          let codFound = this.productData.cBDetail.findIndex(y =>
            y.proveedor == this.selectedDesc)

          if (codFound < 0) {
            this.presentToast('El codigo de barra no coincide con la informacion' +
              'de etiqueta de proveedor. Selecciona otra configuracion.', 'warning')
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

              let ind = this.detail.findIndex(product =>
                product.cb == this.codigoBarra.trim()) //Verificar si el codigo de barra ya fue escaneado
              if (ind < 0) {
                if (Number(this.peso) >= Number(this.productData.U_IL_PesMin)
                  && Number(this.peso) <= Number(this.productData.U_IL_PesMax)) {

                  let findBatch = this.batch.findIndex(y => y.U_IL_CodBar
                    == this.codigoBarra.trim()) //buscar el lote en la lista de lotes
                  if (findBatch < 0) { //Si no encuentra el lote en la lista de lotes entra en esta condicion
                    let fin_ind_batch = this.oldBatchList.findIndex(x =>
                      Number(x.Quantity) == Number(this.peso)) //Buscar en la lista de lotes filtrada un peso que coincida
                    if (fin_ind_batch >= 0) {//Si encuentra un peso que coincide entrara a esta condicion
                      this.detail.push({
                        Code: this.oldBatchList[fin_ind_batch].BatchNum,
                        display: this.oldBatchList[fin_ind_batch].BatchNum
                          .substr(this.oldBatchList[fin_ind_batch].BatchNum.length - 6),
                        cb: this.codigoBarra,
                        attr1: this.lote,
                        expirationDate: '11-12-2019',
                        Quantity: Number(this.oldBatchList[fin_ind_batch].Quantity),
                        uom: this.productData.Uoms[0].BaseUom
                      })

                      this.cantidadEscaneada++
                      // this.cantidadPeso = this.cantidadPeso + Number(this.peso)
                      this.oldBatchList.splice(fin_ind_batch, 1)
                      this.presentToast('Se agrego a la lista', 'success')

                    } else { //Si no encuentra un peso coincidente escogera el lote SI
                      let findLotes = this.batch.find(y => Number(y.Quantity) >= 50)
                      if (findLotes != undefined) {
                        this.detail.push({
                          Code: findLotes.BatchNum,
                          display: findLotes.BatchNum,
                          cb: this.codigoBarra,
                          attr1: this.lote,
                          expirationDate: '11-12-2019',
                          Quantity: Number(this.peso),
                          uom: this.productData.Uoms[0].BaseUom
                        })

                        this.cantidadEscaneada++
                        // this.cantidadPeso = this.cantidadPeso + Number(this.peso)
                        this.presentToast('Se agrego a la lista', 'success')
                      } else {
                        this.presentToast("El codigo de barra no se " +
                          " encontro. Validar con auditoria.", "warning")
                      }
                    }
                  } else { //Si encuentra el lote en la lista original entrara en esta condicion
                    this.detail.push({
                      Code: this.batch[findBatch].BatchNum,
                      display: this.batch[findBatch].BatchNum
                        .substr(this.batch[findBatch].BatchNum.length - 6),
                      cb: this.codigoBarra,
                      attr1: this.lote,
                      expirationDate: '11-12-2019',
                      Quantity: Number(this.batch[findBatch].Quantity),
                      uom: this.productData.Uoms[0].BaseUom
                    })

                    this.cantidadEscaneada++
                    // this.cantidadPeso = this.cantidadPeso + Number(this.peso)
                    this.presentToast('Se agrego a la lista', 'success')

                  }
                } else {
                  this.presentToast('El peso sobrepasa el peso promedio. ' +
                    'Contactar al departamento de datos maestros.' +
                    'O intente selccionando otra configuracion', 'warning')
                }

              } else {
                this.presentToast('El codigo de barra ya fue escaneado', 'warning')
              }
            }
          }
        }


      } else {
        let ind = this.detail.findIndex(product =>
          product.cb == this.codigoBarra.trim())
        console.log(1234);
        if (ind < 0) {
          console.log('No esta en el detail')
          let codFound = this.productData.cBDetail.findIndex(y =>
            y.length == this.codigoBarra.trim().length)

          if (codFound < 0) {
            this.presentToast('El codigo de barra no coincide con la informacion' +
              'de etiqueta de proveedor.', 'warning')
          } else {
            console.log('si coincide')
            let pesoDeEtiqueta = this.codigoBarra.substr(
              this.productData.cBDetail[codFound].peso_pos - 1,
              this.productData.cBDetail[codFound].peso_length)

            if (this.productData.cBDetail[codFound].maneja_decimal == 1) {
              console.log('maneja decimal')
              if (this.productData.cBDetail[codFound].UOM_id != 3) {
                this.peso = Number((Number(pesoDeEtiqueta) / 2.2046).toFixed(2))
              } else {
                this.peso = Number(pesoDeEtiqueta);
              }
              let ind = this.detail.findIndex(product =>
                product.cb == this.codigoBarra.trim()) //Verificar si el codigo de barra ya fue escaneado
              if (ind < 0) {
                if (Number(this.peso) >= Number(this.productData.U_IL_PesMin)
                  && Number(this.peso) <= Number(this.productData.U_IL_PesMax)) {
                  console.log(this.codigoBarra.trim())
                  let findBatch = this.batch.findIndex(y => y.U_IL_CodBar
                    == this.codigoBarra.trim()) //buscar el lote en la lista de lotes
                  if (findBatch < 0) { //Si no encuentra el lote en la lista de lotes entra en esta condicion
                    let fin_ind_batch = this.oldBatchList.findIndex(x =>
                      Number(x.Quantity) == Number(this.peso)) //Buscar en la lista de lotes filtrada un peso que coincida
                    if (fin_ind_batch >= 0) {//Si encuentra un peso que coincide entrara a esta condicion
                      this.detail.push({
                        Code: this.oldBatchList[fin_ind_batch].BatchNum,
                        display: this.oldBatchList[fin_ind_batch].BatchNum
                          .substr(this.oldBatchList[fin_ind_batch].BatchNum.length - 6),
                        cb: this.codigoBarra,
                        attr1: this.lote,
                        expirationDate: '11-12-2019',
                        Quantity: Number(this.oldBatchList[fin_ind_batch].Quantity),
                        uom: this.productData.Uoms[0].BaseUom
                      })

                      this.cantidadEscaneada++
                      // this.cantidadPeso = this.cantidadPeso + Number(this.peso)
                      this.oldBatchList.splice(fin_ind_batch, 1)
                      this.presentToast('Se agrego a la lista', 'success')

                    } else { //Si no encuentra un peso coincidente escogera el lote SI
                      let findLotes = this.batch.find(y => Number(y.Quantity) >= 50)
                      if (findLotes != undefined) {
                        this.detail.push({
                          Code: findLotes.BatchNum,
                          display: findLotes.BatchNum,
                          cb: this.codigoBarra,
                          attr1: this.lote,
                          expirationDate: '11-12-2019',
                          Quantity: Number(this.peso),
                          uom: this.productData.Uoms[0].BaseUom
                        })

                        this.cantidadEscaneada++
                        // this.cantidadPeso = this.cantidadPeso + Number(this.peso)
                        this.presentToast('Se agrego a la lista', 'success')
                      } else {
                        this.presentToast("El codigo de barra no se " +
                          " encontro. Validar con auditoria.", "warning")
                      }
                    }
                  } else { //Si encuentra el lote en la lista original entrara en esta condicion
                    this.detail.push({
                      Code: this.batch[findBatch].BatchNum,
                      display: this.batch[findBatch].BatchNum
                        .substr(this.batch[findBatch].BatchNum.length - 6),
                      cb: this.codigoBarra,
                      attr1: this.lote,
                      expirationDate: '11-12-2019',
                      Quantity: Number(this.batch[findBatch].Quantity),
                    })

                    this.cantidadEscaneada++
                    // this.cantidadPeso = this.cantidadPeso + Number(this.peso)
                    this.presentToast('Se agrego a la lista', 'success')

                  }
                } else {
                  this.presentToast('El peso sobrepasa el peso promedio. ' +
                    'Contactar al departamento de datos maestros.', 'warning')
                }

              } else {
                this.presentToast('El codigo de barra ya fue escaneado', 'warning')
              }
            } else {
              this.peso = getCerosFromEtiqueta(this.productData,
                pesoDeEtiqueta,
                codFound);
              console.log(this.peso)
              let ind = this.detail.findIndex(product =>
                product.cb == this.codigoBarra.trim()) //Verificar si el codigo de barra ya fue escaneado
              if (ind < 0) {
                if (Number(this.peso) >= Number(this.productData.U_IL_PesMin)
                  && Number(this.peso) <= Number(this.productData.U_IL_PesMax)) {
                  console.log(this.codigoBarra.trim())
                  let findBatch = this.batch.findIndex(y => y.U_IL_CodBar
                    == this.codigoBarra.trim()) //buscar el lote en la lista de lotes
                  if (findBatch < 0) { //Si no encuentra el lote en la lista de lotes entra en esta condicion
                    let fin_ind_batch = this.oldBatchList.findIndex(x =>
                      Number(x.Quantity) == Number(this.peso)) //Buscar en la lista de lotes filtrada un peso que coincida
                    if (fin_ind_batch >= 0) {//Si encuentra un peso que coincide entrara a esta condicion
                      this.detail.push({
                        Code: this.oldBatchList[fin_ind_batch].BatchNum,
                        display: this.oldBatchList[fin_ind_batch].BatchNum
                          .substr(this.oldBatchList[fin_ind_batch].BatchNum.length - 6),
                        cb: this.codigoBarra,
                        attr1: this.lote,
                        expirationDate: '11-12-2019',
                        Quantity: Number(this.oldBatchList[fin_ind_batch].Quantity),
                        uom: this.productData.Uoms[0].BaseUom
                      })

                      this.cantidadEscaneada++
                      // this.cantidadPeso = this.cantidadPeso + Number(this.peso)
                      this.oldBatchList.splice(fin_ind_batch, 1)
                      this.presentToast('Se agrego a la lista', 'success')

                    } else { //Si no encuentra un peso coincidente escogera el lote SI
                      let findLotes = this.batch.find(y => Number(y.Quantity) >= 50)
                      if (findLotes != undefined) {
                        this.detail.push({
                          Code: findLotes.BatchNum,
                          display: findLotes.BatchNum,
                          cb: this.codigoBarra,
                          attr1: this.lote,
                          expirationDate: '11-12-2019',
                          Quantity: Number(this.peso),
                          uom: this.productData.Uoms[0].BaseUom
                        })

                        this.cantidadEscaneada++
                        // this.cantidadPeso = this.cantidadPeso + Number(this.peso)
                        this.presentToast('Se agrego a la lista', 'success')
                      } else {
                        this.presentToast("El codigo de barra no se " +
                          " encontro. Validar con auditoria.", "warning")
                      }
                    }
                  } else { //Si encuentra el lote en la lista original entrara en esta condicion
                    this.detail.push({
                      Code: this.batch[findBatch].BatchNum,
                      display: this.batch[findBatch].BatchNum
                        .substr(this.batch[findBatch].BatchNum.length - 6),
                      cb: this.codigoBarra,
                      attr1: this.lote,
                      expirationDate: '11-12-2019',
                      Quantity: Number(this.batch[findBatch].Quantity),
                      uom: this.productData.Uoms[0].BaseUom
                    })

                    this.cantidadEscaneada++
                    this.cantidadPeso = this.cantidadPeso + Number(this.peso)
                    this.presentToast('Se agrego a la lista', 'success')

                  }
                } else {
                  this.presentToast('El peso sobrepasa el peso promedio. ' +
                    'Contactar al departamento de datos maestros.', 'warning')
                }

              } else {
                this.presentToast('El codigo de barra ya fue escaneado', 'warning')
              }
            }
          }
        } else {
          this.presentToast('El codigo de barra ya fue escaneado', 'warning')
        }

      }

      this.peso = 0
    }
    
    this.cantidadPeso = this.detail.map(prod => prod.Quantity).reduce((a,b) => a + b, 0);
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
    });

    await this.load.present()
  }

  hideLoading() {
    this.load.dismiss()
  }

}
