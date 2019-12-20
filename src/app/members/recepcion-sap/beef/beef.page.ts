import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import * as moment from 'moment';
import { Interface } from 'readline';

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
  lote: any

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private receptionService: RecepcionDataService,
    private router: Router,
    private loading: LoadingController,
    private alert: AlertController
  ) { }

  ngOnInit() {
    this.productData = this.receptionService.getOrderData()
    this.lotesRegistrados = this.receptionService.getReceptionData()

    console.log(this.lotesRegistrados)

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

    this.http.get(environment.apiSAP +  '/api/batch/' + this.productData.WhsCode + '/' +  this.productData.ItemCode).toPromise().then((data) => {
      this.productData.batchs = data
      console.log(data)
    }).catch((error) => {
      console.log(error)
      this.presentToast(error.error.error,'danger')
    })

    

    console.log(this.productData)
  }

  submit() {
    this.productData.cajasEscaneadas = this.cantidadEscaneada

    if(this.productData.count != 0 && this.cantidadEscaneada <= 0){
      this.productData.count = this.cantidadEscaneada
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/recepcion-sap'])
    } else if(this.cantidadEscaneada <= 0){
      this.presentToast('Debe igresar una cantidad valida','warning')
    } else if(this.productData.Detail.QryGroup41 == 'Y'){
      this.productData.count = this.cantidadEscaneada
      this.productData.detalle = this.detail
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/recepcion-sap'])
    } else {
      this.productData.count = this.detail.map(lote => lote.quantity).reduce((a, b) => a + b, 0)
      this.productData.detalle = this.detail
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/recepcion-sap'])
    }
    
  }

  eliminar(index) {
    this.cantidadEscaneada--
    this.detail.splice(index, 1)

  }



  getData() {

    if (this.lote == undefined || this.lote == '') {
      this.presentToast('Debes ingresar lote primero', 'warning')
    } else {
      
      if (this.codigoBarra == '') {

      } else {

        let codFound = this.productData.detalle_codigo.findIndex(y => y.length == this.codigoBarra.trim().length)
      
        if (codFound < 0) {

          this.presentToast('El codigo de barra no coincide con la informacion de etiqueta de proveedor.', 'warning')

        } else {
          
          let peso = this.codigoBarra.substr(this.productData.detalle_codigo[codFound].peso_pos - 1, this.productData.detalle_codigo[codFound].peso_length)
          let fecha_prod = this.codigoBarra.substr(this.productData.detalle_codigo[codFound].fecha_prod_pos - 1, this.productData.detalle_codigo[codFound].fecha_prod_length)

          console.log('peso: ' + peso + ' fecha_prod: ' + fecha_prod)

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

          let fechaExp
          let date = moment(fecha_prod, this.productData.detalle_codigo[codFound].fecha_prod_orden).toString()
          this.fechaProd = new Date(date)
          fechaExp = (this.fechaProd.getMonth() + 1) + '-' + this.fechaProd.getDay() + '-' + this.fechaProd.getFullYear()


          // if (this.productData.Detail.QryGroup41 == 'Y') {
          //   let ind = this.detail.findIndex(product => product.code == this.codigoBarra.trim())
          //   let codFoundInBatchs = this.productData.batchs.findIndex(y => y.U_IL_CodBar == this.codigoBarra.trim())
          //   if (ind < 0 && codFoundInBatchs < 0) {
          //     this.detail.push({
          //       name: this.codigoBarra.substr(this.codigoBarra.length - 36),
          //       code: this.codigoBarra.trim(),
          //       attr1: this.lote,
          //       expirationDate: '11-12-2019',
          //       quantity: 18.14
          //     })
          //     this.cantidadEscaneada++

          //     this.presentToast('Se agrego a la lista', 'success')
          //   } else {
          //     this.presentToast('El codigo de barra ya fue escaneado', 'warning')
          //   }
          // } else {

            let pesProm

            if(Number(this.productData.Detail.U_IL_PesMin) == 0 && Number(this.productData.Detail.U_IL_PesMax) == 0){
              pesProm = 100
              if(Number(this.peso) <= pesProm){
                if (this.codigoBarra.length <= 36) {
  
                  console.log(this.codigoBarra.trim())
    
                  let ind = this.detail.findIndex(product => product.code == this.codigoBarra.trim())
                  let codFoundInBatchs = this.productData.batchs.findIndex(y => y.U_IL_CodBar == this.codigoBarra.trim())
    
                  console.log('codigo mide menos de 36 caracteres')
    
                  if (ind < 0 && codFoundInBatchs < 0) {
    
                    this.detail.push({
                      name: this.codigoBarra,
                      code: this.codigoBarra.trim(),
                      attr1: this.lote,
                      expirationDate: '11-12-2019',
                      quantity: this.peso
                    })
                    this.cantidadEscaneada++
                    this.presentToast('Se agrego a la lista', 'success')
    
                  } else {
                    this.presentToast('El codigo de barra ya fue escaneado', 'warning')
                  }
                } else {
    
                  console.log(this.codigoBarra.trim())
    
                  let ind = this.detail.findIndex(product => product.code == this.codigoBarra.trim())
                  let codFoundInBatchs = this.productData.batchs.findIndex(y => y.U_IL_CodBar == this.codigoBarra.trim())
    
                  console.log('codigo mide mas de 36 caracteres')
    
                  if (ind < 0 && codFoundInBatchs < 0) {
                    this.detail.push({
                      name: this.codigoBarra.substr(this.codigoBarra.length - 36),
                      code: this.codigoBarra.trim(),
                      attr1: this.lote,
                      expirationDate: '11-12-2019',
                      quantity: this.peso
                    })
                    this.cantidadEscaneada++
    
                    this.presentToast('Se agrego a la lista', 'success')
    
                  } else {
    
                    this.presentToast('El codigo de barra ya fue escaneado', 'warning')
    
                  }
                }
              } else {
                this.presentToast('El peso sobre pasa del promedio. Contactar a departamento de sistemas','warning')
              }
            } else {
              if(Number(this.peso) >= Number(this.productData.Detail.U_IL_PesMin) && Number(this.peso) <= Number(this.productData.Detail.U_IL_PesMax)){
                console.log('Cumple peso promedio')
                if (this.codigoBarra.length <= 36) {
  
                  console.log(this.codigoBarra.trim())
    
                  let ind = this.detail.findIndex(product => product.code == this.codigoBarra.trim())
                  let codFoundInBatchs = this.productData.batchs.findIndex(y => y.U_IL_CodBar == this.codigoBarra.trim())
    
                  console.log('codigo mide menos de 36 caracteres')
    
                  if (ind < 0 && codFoundInBatchs < 0) {
    
                    this.detail.push({
                      name: this.codigoBarra,
                      code: this.codigoBarra.trim(),
                      attr1: this.lote,
                      expirationDate: '11-12-2019',
                      quantity: this.peso
                    })
                    this.cantidadEscaneada++
                    this.presentToast('Se agrego a la lista', 'success')
    
                  } else {
                    this.presentToast('El codigo de barra ya fue escaneado', 'warning')
                  }
                } else {
    
                  console.log(this.codigoBarra.trim())
    
                  let ind = this.detail.findIndex(product => product.code == this.codigoBarra.trim())
                  let codFoundInBatchs = this.productData.batchs.findIndex(y => y.U_IL_CodBar == this.codigoBarra.trim())
    
                  console.log('codigo mide mas de 36 caracteres')
    
                  if (ind < 0 && codFoundInBatchs < 0) {
                    this.detail.push({
                      name: this.codigoBarra.substr(this.codigoBarra.length - 36),
                      code: this.codigoBarra.trim(),
                      attr1: this.lote,
                      expirationDate: '11-12-2019',
                      quantity: this.peso
                    })
                    this.cantidadEscaneada++
    
                    this.presentToast('Se agrego a la lista', 'success')
    
                  } else {
    
                    this.presentToast('El codigo de barra ya fue escaneado', 'warning')
    
                  }
                }
              } else {
                this.presentToast('El peso no cumple con el peso promedio. Contactar a departamento de sistemas','warning')
              }
            } 
          // }
          this.fechaProd = null
          this.peso = 0
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

}
