import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { environment } from 'src/environments/environment';
import { SettingsService } from '../../../services/settings.service';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import * as moment from 'moment';

@Component({
  selector: 'app-beef',
  templateUrl: './beef.page.html',
  styleUrls: ['./beef.page.scss'],
})
export class BeefPage implements OnInit {

  productData: any
  codigoBarra
  peso
  fechaProd: Date
  detail = []
  cantidadEscaneada: number = 0
  lote: any
  tarima
  batch: any
  load
  data
  porcentaje: string;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private receptionService: RecepcionDataService,
    private router: Router,
    private loading: LoadingController,
    private platform: Platform,
    private settings: SettingsService,
    private alert: AlertController
  ) { }

  ngOnInit() {
    this.productData = this.receptionService.getOrderData()

    if (!this.productData.detalle) {
      this.productData.detalle = []
    } else {
      this.detail = this.productData.detalle
    }

    this.presentLoading('Buscando Lotes de producto...')

    this.http.get(environment.apiSAP +  '/api/batch/' + this.productData.WhsCode + '/' +  this.productData.ItemCode).toPromise().then((data) => {
      console.log(data)
      this.batch = data
    }).catch((error) => {
      this.presentToast(error.error.error,'danger')
    }).finally(() => {
      this.hideLoading()
    })


    console.log(this.productData)
    if(this.productData.cajasEscaneadas){
      this.cantidadEscaneada = Number(this.productData.cajasEscaneadas)
    } else {
      this.cantidadEscaneada = 0
    }

    if (this.platform.is("cordova")) {
      this.data = this.settings.fileData
      this.porcentaje = this.data.porcentaje
    } else {
      this.porcentaje = "10"
    }
   
  }

  submit() {
    this.productData.cajasEscaneadas = this.cantidadEscaneada

    if(this.productData.count != 0 && this.cantidadEscaneada <= 0){
      this.productData.count = this.cantidadEscaneada
      this.productData.pallet = this.tarima
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/surtido-sap'])
    } else if(this.productData.cajasEscaneadas  <= 0){
      this.presentToast('Debe igresar una cantidad valida','warning')
    } else if(this.productData.Detail.QryGroup42 == 'Y'){
      this.productData.pallet = this.tarima
      this.productData.count = this.cantidadEscaneada
      this.productData.detalle = this.detail
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/surtido-sap'])
    } else {
      this.productData.count = this.detail.map(lote => lote.quantity).reduce((a, b) => a + b, 0)

      let validPercent = (Number(this.porcentaje) / 100) * Number(this.productData.OpenInvQty)
      let validQuantity = Number(validPercent) + Number(this.productData.OpenInvQty)

      if(this.productData.count > Number(validQuantity)){
        this.presentToast('Cantidad Excede a la cantidad solicitada','warning')
      } else {
        this.productData.detalle = this.detail
      this.productData.pallet = this.tarima
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/surtido-sap'])
      }
      
    }
    
  }

  eliminar(index){
    this.cantidadEscaneada--
    this.detail.splice(index,1)
  }

  getData() {
    if (this.codigoBarra == '') {

    } else {
      let codFound = this.productData.detalle_codigo.findIndex(y => y.length == this.codigoBarra.trim().length)

      if (codFound < 0) {
        this.presentToast('El codigo de barra no coincide con la informacion de etiqueta de proveedor.', 'warning')
      } else {

        let peso = this.codigoBarra.substr(this.productData.detalle_codigo[codFound].peso_pos - 1, this.productData.detalle_codigo[codFound].peso_length)
        let fecha_prod = this.codigoBarra.substr(this.productData.detalle_codigo[codFound].fecha_prod_pos - 1, this.productData.detalle_codigo[codFound].fecha_prod_length)

        console.log('peso: ' + peso +  'fecha_prod: ' + fecha_prod)

        if(this.productData.detalle_codigo[codFound].maneja_decimal == 1){
          if (this.productData.detalle_codigo[codFound].UOM_id != 3) {
            this.peso = Number((Number(peso) / 2.2046).toFixed(2))
          } else {
            this.peso = peso
          }
        } else {
          let contCero: number = 0
        for(var i = 0; i < peso.length; i ++){
          if(peso[i] == '0'){
            contCero++
          } else {
            break
          }
        }
        console.log(contCero)
        if (this.productData.detalle_codigo[codFound].UOM_id != 3) {
          if(contCero == 3){
            peso = peso.substring(0, peso.length - 1) + '.' + peso.substring(peso.length - 1, peso.length + 1)
          } else if(contCero == 4){
            peso = peso.substring(peso.length - 2)
          } else {
            peso = peso.substring(0, peso.length - 2) + '.' + peso.substring(peso.length - 2, peso.length + 1)
          }

          console.log(peso)
          if (peso != '.') {

            this.peso = Number((Number(peso) / 2.2046).toFixed(2))
            console.log(this.peso)
          } else {

            peso = 0
          }
        } else {
          peso = peso.substring(0, peso.length - 2) + '.' + peso.substring(peso.length - 2, peso.length + 1)
          console.log(peso)
          if (peso != '.') {

            this.peso = Number(Number(peso).toFixed(2))

          } else {

            peso = 0

          }
        }
        }

        // if (peso == 0 && (this.peso == undefined || this.peso <= 0)) {
        //   this.presentToast('Debes ingrear peso de producto.', 'warning')
        //   return
        // }

        // if (fecha_prod == '' && this.fechaProd == undefined) {
        //   this.presentToast('Debes ingresar fecha de produccion.', 'warning')
        //   return
        // }

        let fechaExp
        let date = moment(fecha_prod, this.productData.detalle_codigo[codFound].fecha_prod_orden).toString()
        this.fechaProd = new Date(date)
        fechaExp = (this.fechaProd.getMonth() + 1) + '-' + this.fechaProd.getDay() + '-' + this.fechaProd.getFullYear()
        console.log(fechaExp)

        if(this.productData.Detail.ItemCode == 'A0202088'){
          let ind = this.detail.findIndex(product => product.code == this.codigoBarra.trim()) //Verificar si el codigo de barra ya fue escaneado
        if (ind < 0) { //Si el codigo de barra no ah sido agregado a la lista entrara a esta condicion
          if (Number(this.productData.Detail.U_IL_PesMin) == 0 && Number(this.productData.Detail.U_IL_PesMax) == 0) { //Si el producto no tiene pesoMax y pesoMin configurado entrara aqui
            if (Number(this.peso <= 100)) {
              let findBatch = this.batch.findIndex(y => y.BatchNum == this.codigoBarra.substr(25,this.codigoBarra.length).trim()) //buscar el lote en la lista de lotes

              if (findBatch < 0) { //Si no encuentra el lote en la lista de lotes entra en esta condicion

                let old_batch_list = this.batch.filter(x => Number(x.CreateDate) < 20191218) //Filtrar la lista de lotes a lotes anteriores al 18
                let fin_ind_batch = old_batch_list.findIndex(x => Number(x.Quantity) == Number(this.peso)) //Buscar en la lista de lotes filtrada un peso que coincida

                if (fin_ind_batch >= 0) {//Si encuentra un peso que coincide entrara a esta condicion
                  this.detail.push({
                    name: old_batch_list[fin_ind_batch].BatchNum,
                    display: old_batch_list[fin_ind_batch].BatchNum.substr(old_batch_list[fin_ind_batch].BatchNum.length - 6),
                    code: this.codigoBarra,
                    attr1: this.lote,
                    expirationDate: '11-12-2019',
                    quantity: old_batch_list[fin_ind_batch].Quantity,
                    pallet: this.tarima
                  })
                } else { //Si no encuentra un peso coincidente escogera el lote SI
                  let findSi = this.batch.findIndex(x => x.BatchNum == 'SI') //Buscamos el lote SI para vereficiar cantidad

                  if(findSi >= 0){
                    if(this.batch[findSi].Quantity < Number(this.peso)){
                      this.presentToast('No hay suficiente cantidad en el lote','warning')
                    } else {
                      this.detail.push({
                        name: 'SI',
                        display: 'SI',
                        code: this.codigoBarra,
                        attr1: this.lote,
                        expirationDate: '11-12-2019',
                        quantity: Number(this.peso),
                        pallet: this.tarima
                      })
    
                      this.cantidadEscaneada++
                      this.presentToast('Se agrego a la lista', 'success')
                    }
                  } else {
                    this.presentToast('El codigo de barra: ' + this.codigoBarra.trim() + 'no se encuentra en inventario','warning')
                  }
                }
              } else { //Si encuentra el lote en la lista original entrara en esta condicion
                this.detail.push({
                  name: this.batch[findBatch].BatchNum,
                  display: this.batch[findBatch].BatchNum.substr(this.batch[findBatch].BatchNum.length - 6),
                  code: this.codigoBarra,
                  attr1: this.lote,
                  expirationDate: '11-12-2019',
                  quantity: this.peso,
                  pallet: this.tarima
                })

                this.cantidadEscaneada++
                this.presentToast('Se agrego a la lista', 'success')

              }
            } else {
              this.presentToast('El peso sobrepasa el peso promedio. Contactar al departamento de sistemas.', 'warning')
            }
          } else { //Entrara a esta condicion si el producto tiene configurado pesoMax y pesoMin
            if (Number(this.peso) >= Number(this.productData.Detail.U_IL_PesMin) && Number(this.peso) <= Number(this.productData.Detail.U_IL_PesMax)) {

              let findBatch = this.batch.findIndex(y => y.BatchNum == this.codigoBarra.substr(25,this.codigoBarra.length).trim()) //buscar el lote en la lista de lotes

              if (findBatch < 0) { //Si no encuentra el lote en la lista de lotes entra en esta condicion

                let old_batch_list = this.batch.filter(x => Number(x.CreateDate) < 20191218) //Filtrar la lista de lotes a lotes anteriores al 18
                let fin_ind_batch = old_batch_list.findIndex(x => Number(x.Quantity) == Number(this.peso)) //Buscar en la lista de lotes filtrada un peso que coincida

                if (fin_ind_batch >= 0) {//Si encuentra un peso que coincide entrara a esta condicion
                  this.detail.push({
                    name: old_batch_list[fin_ind_batch].BatchNum,
                    display: old_batch_list[fin_ind_batch].BatchNum.substr(old_batch_list[fin_ind_batch].BatchNum.length - 6),
                    code: this.codigoBarra,
                    attr1: this.lote,
                    expirationDate: '11-12-2019',
                    quantity: old_batch_list[fin_ind_batch].Quantity,
                    pallet: this.tarima
                  })
                  this.cantidadEscaneada++
                  this.presentToast('Se agrego a la lista', 'success')
                } else { //Si no encuentra un peso coincidente escogera el lote SI
                  let findSi = this.batch.findIndex(x => x.BatchNum == 'SI') //Buscamos el lote SI para vereficiar cantidad

                  if(findSi >= 0){
                    if(this.batch[findSi].Quantity < Number(this.peso)){
                      this.presentToast('No hay suficiente cantidad en el lote','warning')
                    } else {
                      this.detail.push({
                        name: 'SI',
                        display: 'SI',
                        code: this.codigoBarra,
                        attr1: this.lote,
                        expirationDate: '11-12-2019',
                        quantity: Number(this.peso),
                        pallet: this.tarima
                      })
    
                      this.cantidadEscaneada++
                      this.presentToast('Se agrego a la lista', 'success')
                    }
                  } else {
                    this.presentToast('El codigo de barra: ' + this.codigoBarra.trim() + 'no se encuentra en inventario','warning')
                  }
                }
              } else { //Si encuentra el lote en la lista original entrara en esta condicion
                this.detail.push({
                  name: this.batch[findBatch].BatchNum,
                  display: this.batch[findBatch].BatchNum.substr(this.batch[findBatch].BatchNum.length - 6),
                  code: this.codigoBarra,
                  attr1: this.lote,
                  expirationDate: '11-12-2019',
                  quantity: this.peso,
                  pallet: this.tarima
                })

                this.cantidadEscaneada++
                this.presentToast('Se agrego a la lista', 'success')

              }
            } else {
              this.presentToast('El peso sobrepasa el peso promedio. Contactar al departamento de sistemas.', 'warning')
            }
          }
        } else {
          this.presentToast('El codigo de barra ya fue escaneado', 'warning')
        }
        } else {
          let ind = this.detail.findIndex(product => product.code == this.codigoBarra.trim()) //Verificar si el codigo de barra ya fue escaneado
        if (ind < 0) { //Si el codigo de barra no ah sido agregado a la lista entrara a esta condicion
          if (Number(this.productData.Detail.U_IL_PesMin) == 0 && Number(this.productData.Detail.U_IL_PesMax) == 0) { //Si el producto no tiene pesoMax y pesoMin configurado entrara aqui
            if (Number(this.peso <= 100)) {
              let findBatch = this.batch.findIndex(y => y.U_IL_CodBar == this.codigoBarra.trim()) //buscar el lote en la lista de lotes

              if (findBatch < 0) { //Si no encuentra el lote en la lista de lotes entra en esta condicion

                let old_batch_list = this.batch.filter(x => Number(x.CreateDate) < 20191218) //Filtrar la lista de lotes a lotes anteriores al 18
                let fin_ind_batch = old_batch_list.findIndex(x => Number(x.Quantity) == Number(this.peso)) //Buscar en la lista de lotes filtrada un peso que coincida

                if (fin_ind_batch >= 0) {//Si encuentra un peso que coincide entrara a esta condicion
                  this.detail.push({
                    name: old_batch_list[fin_ind_batch].BatchNum,
                    display: old_batch_list[fin_ind_batch].BatchNum.substr(old_batch_list[fin_ind_batch].BatchNum.length - 6),
                    code: this.codigoBarra,
                    attr1: this.lote,
                    expirationDate: '11-12-2019',
                    quantity: old_batch_list[fin_ind_batch].Quantity,
                    pallet: this.tarima
                  })
                } else { //Si no encuentra un peso coincidente escogera el lote SI
                  let findSi = this.batch.findIndex(x => x.BatchNum == 'SI') //Buscamos el lote SI para vereficiar cantidad

                  if(findSi >= 0){
                    if(this.batch[findSi].Quantity < Number(this.peso)){
                      this.presentToast('No hay suficiente cantidad en el lote','warning')
                    } else {
                      this.detail.push({
                        name: 'SI',
                        display: 'SI',
                        code: this.codigoBarra,
                        attr1: this.lote,
                        expirationDate: '11-12-2019',
                        quantity: Number(this.peso),
                        pallet: this.tarima
                      })
    
                      this.cantidadEscaneada++
                      this.presentToast('Se agrego a la lista', 'success')
                    }
                  } else {
                    this.presentToast('El codigo de barra: ' + this.codigoBarra.trim() + 'no se encuentra en inventario','warning')
                  }
                }
              } else { //Si encuentra el lote en la lista original entrara en esta condicion
                this.detail.push({
                  name: this.batch[findBatch].BatchNum,
                  display: this.batch[findBatch].BatchNum.substr(this.batch[findBatch].BatchNum.length - 6),
                  code: this.codigoBarra,
                  attr1: this.lote,
                  expirationDate: '11-12-2019',
                  quantity: this.peso,
                  pallet: this.tarima
                })

                this.cantidadEscaneada++
                this.presentToast('Se agrego a la lista', 'success')

              }
            } else {
              this.presentToast('El peso sobrepasa el peso promedio. Contactar al departamento de sistemas.', 'warning')
            }
          } else { //Entrara a esta condicion si el producto tiene configurado pesoMax y pesoMin
            if (Number(this.peso) >= Number(this.productData.Detail.U_IL_PesMin) && Number(this.peso) <= Number(this.productData.Detail.U_IL_PesMax)) {

              let findBatch = this.batch.findIndex(y => y.U_IL_CodBar == this.codigoBarra.trim()) //buscar el lote en la lista de lotes

              if (findBatch < 0) { //Si no encuentra el lote en la lista de lotes entra en esta condicion

                let old_batch_list = this.batch.filter(x => Number(x.CreateDate) < 20191218) //Filtrar la lista de lotes a lotes anteriores al 18
                let fin_ind_batch = old_batch_list.findIndex(x => Number(x.Quantity) == Number(this.peso)) //Buscar en la lista de lotes filtrada un peso que coincida

                if (fin_ind_batch >= 0) {//Si encuentra un peso que coincide entrara a esta condicion
                  this.detail.push({
                    name: old_batch_list[fin_ind_batch].BatchNum,
                    display: old_batch_list[fin_ind_batch].BatchNum.substr(old_batch_list[fin_ind_batch].BatchNum.length - 6),
                    code: this.codigoBarra,
                    attr1: this.lote,
                    expirationDate: '11-12-2019',
                    quantity: old_batch_list[fin_ind_batch].Quantity,
                    pallet: this.tarima
                  })
                  this.cantidadEscaneada++
                  this.presentToast('Se agrego a la lista', 'success')
                } else { //Si no encuentra un peso coincidente escogera el lote SI
                  let findSi = this.batch.findIndex(x => x.BatchNum == 'SI') //Buscamos el lote SI para vereficiar cantidad

                  if(findSi >= 0){
                    if(this.batch[findSi].Quantity < Number(this.peso)){
                      this.presentToast('No hay suficiente cantidad en el lote','warning')
                    } else {
                      this.detail.push({
                        name: 'SI',
                        display: 'SI',
                        code: this.codigoBarra,
                        attr1: this.lote,
                        expirationDate: '11-12-2019',
                        quantity: Number(this.peso),
                        pallet: this.tarima
                      })
    
                      this.cantidadEscaneada++
                      this.presentToast('Se agrego a la lista', 'success')
                    }
                  } else {
                    this.presentToast('El codigo de barra: ' + this.codigoBarra.trim() + 'no se encuentra en inventario','warning')
                  }
                }
              } else { //Si encuentra el lote en la lista original entrara en esta condicion
                this.detail.push({
                  name: this.batch[findBatch].BatchNum,
                  display: this.batch[findBatch].BatchNum.substr(this.batch[findBatch].BatchNum.length - 6),
                  code: this.codigoBarra,
                  attr1: this.lote,
                  expirationDate: '11-12-2019',
                  quantity: this.peso,
                  pallet: this.tarima
                })

                this.cantidadEscaneada++
                this.presentToast('Se agrego a la lista', 'success')

              }
            } else {
              this.presentToast('El peso sobrepasa el peso promedio. Contactar al departamento de sistemas.', 'warning')
            }
          }
        } else {
          this.presentToast('El codigo de barra ya fue escaneado', 'warning')
        }
        }
        
        // }

        

        this.fechaProd = null
        this.peso = 0
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
