import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { environment } from 'src/environments/environment';
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
  batch: any

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

    if (!this.productData.detalle) {
      this.productData.detalle = []
    } else {
      this.detail = this.productData.detalle
    }

    this.http.get(environment.apiSAP +  '/api/batch/' + this.productData.WhsCode + '/' +  this.productData.ItemCode).toPromise().then((data) => {
      console.log(data)
      this.batch = data
    })
    console.log(this.productData)
  }

  submit() {
    this.productData.cajasEscaneadas = this.cantidadEscaneada

    if(this.productData.count != 0 && this.cantidadEscaneada <= 0){
      this.productData.count = this.cantidadEscaneada
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/surtido-sap'])
    } else if(this.cantidadEscaneada <= 0){
      this.presentToast('Debe igresar una cantidad valida','warning')
    } else if(this.productData.Detail.QryGroup41 == 'Y'){
      this.productData.count = this.cantidadEscaneada
      this.productData.detalle = this.detail
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/surtido-sap'])
    } else {
      this.productData.count = this.detail.map(lote => lote.quantity).reduce((a, b) => a + b, 0)
      this.productData.detalle = this.detail
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/surtido-sap'])
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


        // if (this.productData.Detail.QryGroup41 == 'Y') {
        //   let ind = this.detail.findIndex(product => product.code == this.codigoBarra.trim())
        //   let findBatch = this.batch.findIndex(y => y.U_IL_CodBar == this.codigoBarra.trim())

        //   if(findBatch < 0){
        //     this.presentToast('El codigo de barra no se encuentra en inventario','warning')
        //   } else {
        //     if (ind < 0) {
        //       this.detail.push({
        //         name: this.batch[findBatch].BatchNum,
        //         code: this.codigoBarra.trim(),
        //         attr1: this.lote,
        //         expirationDate: '11-12-2019',
        //         quantity: Number(this.productData.NumPerMsr)
        //       })
        //       this.cantidadEscaneada++
  
        //       this.presentToast('Se agrego a la lista', 'success')
        //     } else {
        //       this.presentToast('El codigo de barra ya fue escaneado', 'warning')
        //     }
        //   }
          
        // } else {

          if (this.codigoBarra.length <= 36) {

            let ind = this.detail.findIndex(product => product.code == this.codigoBarra.trim())
            let findBatch = this.batch.findIndex(y => y.U_IL_CodBar == this.codigoBarra.trim())
            
            console.log('codigo mide menos de 36 caracteres')

            if(findBatch < 0){ 
              this.presentToast('El codigo de barra no se encuentra en inventario','warning')
            } else {
              if (ind < 0) {
                this.detail.push({
                  name: this.batch[findBatch].BatchNum,
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
            let ind = this.detail.findIndex(product => product.code == this.codigoBarra.trim())
            let findBatch = this.batch.findIndex(y => y.U_IL_CodBar == this.codigoBarra.trim())

            console.log('codigo mide mas de 36 caracteres')
            
            if(findBatch < 0){
              this.presentToast('El codigo de barra no se encuentra en inventario','warning')
            } else {
              if (ind < 0) {
                this.detail.push({
                  name: this.batch[findBatch].BatchNum,
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
          }
        // }

        

        this.fechaProd = null
        this.peso = 0
      }
    }

    // this.http.get(environment.apiWMS + '/validateCodeBarInventoryRec/' + this.codigoBarra).toPromise().then((data) => {

    // if (this.productData.detalle.findIndex(product => product.codigobarras == this.codigoBarra) != -1 || data) {

    //   console.log(this.codigoBarra)

    //   this.presentToast('Ya existe este codigo. Intenta de nuevo.', 'warning')

    // } else {




    // }

    // })


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
