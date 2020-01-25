import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SettingsService } from '../../../services/settings.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-abarrotes-batch',
  templateUrl: './abarrotes-batch.page.html',
  styleUrls: ['./abarrotes-batch.page.scss'],
})
export class AbarrotesBatchPage implements OnInit {

  productData: any
  cantidad: number = 0
  lotes = []
  lote: any
  fechaCad: Date = new Date()
  batch: any
  tarima
  loteselect
  data
  porcentaje: any;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private platform: Platform,
    private settings: SettingsService,
    private receptionService: RecepcionDataService
  ) { }

  ngOnInit() {
    this.productData= this.receptionService.getOrderData()
    if(this.productData.count){
      this.cantidad = this.productData.count
    }

    if(!this.productData.detalle){
      this.productData.detalle = []
    } else {
      this.lotes = this.productData.detalle
    }

    if(!this.productData.pallet){
      this.productData.pallet = ''
    } else {
      this.tarima = this.productData.pallet
    }

    this.http.get(environment.apiSAP + '/api/batch/' + this.productData.WhsCode + '/' +  this.productData.ItemCode).toPromise().then((data) => {
      console.log(data)
      this.batch = data
    }).catch(() => {
      this.presentToast('Error al traer lotes de producto','danger')
    })

    if (this.platform.is("cordova")) {
      this.data = this.settings.fileData
      this.porcentaje = this.data.porcentaje
    } else {
      this.porcentaje = "10"
    }
  }

  addLote(){
    
    if(this.tarima == undefined|| this.cantidad <= 0 || this.lote == undefined || this.lote == ''){
      this.presentToast('Datos faltantes','warning')
      return
    }
    this.fechaCad = new Date(this.fechaCad)
    let fechaExp = this.fechaCad.getMonth() + '-' + this.fechaCad.getDay() + '-' + this.fechaCad.getFullYear()

    let dif = Math.abs(Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4)) - Number(this.productData.OpenInvQty))

    console.log(dif)
    
    if(dif < 2){
      this.lotes.push({
        name: this.lote,
        expirationDate: '11-22-2019', 
        quantity: Number(this.productData.OpenInvQty),
        code: '',
        att1: '',
        pedimento: '',
        contador: Number(this.cantidad),
        pallet: this.tarima
      })
    } else {
      let validPercent = (Number(this.porcentaje) / 100) * Number(this.productData.OpenInvQty)
      let validQuantity = Number(validPercent) + Number(this.productData.OpenInvQty)

      console.log(validPercent)
      console.log(validQuantity)

      if(Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4)) > Number(validQuantity)){
        this.presentToast('Cantidad ingresada excede de la cantidad solicitada','warning')
      } else {
        this.lotes.push({
          name: this.lote,
          expirationDate: '11-22-2019', 
          quantity: Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4)),
          code: '',
          att1: '',
          pedimento: '',
          contador: Number(this.cantidad),
          pallet: this.tarima
        }) 
      }
    }

    

    
  }

  eliminar(index){
    this.lotes.splice(index,1)
  }

  acceptRecepton(){
    
    if(this.productData.count != 0 && this.cantidad == 0){
      this.productData.count = this.cantidad
      this.productData.pallet = this.tarima
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/surtido-sap'])
    } else if(this.cantidad <= 0){
      this.presentToast('Debe igresar una cantidad valida','warning')
      return
    } else if(this.productData.Detail.QryGroup42 == 'Y'){
      this.productData.count = this.cantidad
      this.productData.detalle = this.lotes
      this.productData.pallet = this.tarima
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/surtido-sap'])
    } else {
      this.productData.count = this.lotes.map(lote => lote.quantity).reduce((a,b) => a + b, 0)
      this.productData.detalle = this.lotes
      this.productData.pallet = this.tarima
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/surtido-sap'])
    }

  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      color: color,
      duration: 4000 
    });
    toast.present();
  }

}
