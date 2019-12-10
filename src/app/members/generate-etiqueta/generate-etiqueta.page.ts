import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import * as moment from 'moment';

@Component({
  selector: 'app-generate-etiqueta',
  templateUrl: './generate-etiqueta.page.html',
  styleUrls: ['./generate-etiqueta.page.scss'],
})
export class GenerateEtiquetaPage implements OnInit {

  order: any
  load
  number
  codigoBarra
  lote
  peso

  fechaProd: Date
  constructor( private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,) { }

  ngOnInit() {
    
  }

  async getOrden() {

    await this.presentLoading('Buscando....')

    this.http.get(environment.apiWMS + '/codebardescriptionsVariants/' + this.number).toPromise().then((prod: any) => {
      this.order = prod
      console.log(prod)
    }).catch((error) =>{
      console.log(error)
      this.presentToast("Error al buscar producto. Intenta de Nuevo.",'warning')
    }).finally(() => {
      this.hideLoading()
    })
    
  }

  getData(){

    if (this.codigoBarra == '') {

    } else {
    let codFound = this.order.findIndex(y => y.length == this.codigoBarra.trim().length)
    if (codFound < 0) {
      this.presentToast('El codigo de barra no coincide con la informacion de etiqueta de proveedor.', 'warning')
    } else {

      let peso = this.codigoBarra.substr(this.order[codFound].peso_pos - 1, this.order[codFound].peso_length)
      let fecha_cad = this.codigoBarra.substr(this.order[codFound].fecha_cad_pos - 1, this.order[codFound].fecha_cad_length)
      let serie = this.codigoBarra.substr(this.order[codFound].numero_serie_pos - 1, this.order[codFound].numero_serie_length)
      let gtin = this.codigoBarra.substr(this.order[codFound].gtin_pos - 1, this.order[codFound].gtin_length)
      let sku = this.codigoBarra.substr(this.order[codFound].sku_pos - 1, this.order[codFound].sku_length)
      let fecha_prod = this.codigoBarra.substr(this.order[codFound].fecha_prod_pos - 1, this.order[codFound].fecha_prod_length)

      console.log('peso: ' + peso + '  fecha_cad:  ' + fecha_cad + '  serie: ' + serie + '  gtin: ' + gtin + '  sku: ' + sku + '  fecha_prod: ' + fecha_prod)

      if(this.order[codFound].maneja_decimal == 1){
        if (this.order[codFound].UOM_id != 3) {
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
      console.log('Cantidad de Ceros:' + contCero)
      if (this.order[codFound].UOM_id != 3) {
        if(contCero == 3){
          peso = peso.substring(0, peso.length - 1) + '.' + peso.substring(peso.length - 1, peso.length + 1)
        } else if(contCero == 4){
          peso = peso.substring(peso.length - 2)
        } else {
          peso = peso.substring(0, peso.length - 2) + '.' + peso.substring(peso.length - 2, peso.length + 1)
        }

        console.log('Peso:'  + peso)
        if (peso != '.') {

          this.peso = Number((Number(peso) / 2.2046).toFixed(2))
          console.log(this.peso)
        } else {

          peso = 0
        }
      } else {
        peso = peso.substring(0, peso.length - 2) + '.' + peso.substring(peso.length - 2, peso.length + 1)
        
        console.log('Peso:'  + peso)
        if (peso != '.') {

          this.peso = Number(Number(peso).toFixed(2))

        } else {

          peso = 0

        }
      }
      }

      let fechaExp
  
          let date = moment(fecha_prod, this.order[codFound].fecha_prod_orden).toString()
          this.fechaProd = new Date(date)
          fechaExp = (this.fechaProd.getMonth() + 1) + '-' + this.fechaProd.getDay() + '-' + this.fechaProd.getFullYear()
          console.log('Fecha:' + fechaExp)
      
      let etiqueta = {
        lote: this.lote,
        gti: gtin,
        peso: this.peso,
        itemcode: this.order[0].codigo_sap,
        itemname: this.order[0].descripcion_producto,
        fecha: fechaExp
      }

      console.log(etiqueta)
      this.http.post('http://apisap.ccfn.com.mx:82/api/reimp', etiqueta).toPromise().then((resp: any) => {
        console.log(resp)
      })
      
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
