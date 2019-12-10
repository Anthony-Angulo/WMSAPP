import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';

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

  constructor(
    private toastController: ToastController,
    private router: Router,
    private receptionService: RecepcionDataService
  ) { }

  ngOnInit() {
    this.productData= this.receptionService.getOrderData()
    console.log(this.productData)
    if(this.productData.count){
      this.cantidad = this.productData.count
    }

    if(!this.productData.detalle){
      this.productData.detalle = []
    } else {
      this.lotes = this.productData.detalle
    }
  }

  eliminar(index){
    this.lotes.splice(index,1)
  }

  addLote(){
    if(this.fechaCad == undefined || this.cantidad <= 0){
      this.presentToast('Datos faltantes','warning')
      return
    }
    this.fechaCad = new Date(this.fechaCad)
    let fechaExp = this.fechaCad.getMonth() + '-' + this.fechaCad.getDay() + '-' + this.fechaCad.getFullYear()
   
    this.lotes.push({
      name: this.lote,
      expirationDate: fechaExp, 
      quantity: Number(this.cantidad * Number(this.productData.NumPerMsr)).toFixedNoRounding(4),
      code: '',
      att1: ''
    }) 

  }

  acceptRecepton(){

    if(this.productData.count != 0 && this.cantidad == 0){
      this.productData.count = this.cantidad
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/recepcion-sap'])
    } else if(this.cantidad <= 0){
      this.presentToast('Debe igresar una cantidad valida','warning')
      return
    } else if(this.productData.Detail.QryGroup41 == 'Y'){
      this.productData.count = this.cantidad
      this.productData.detalle = this.lotes
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/recepcion-sap'])
    } else {
      this.productData.count = this.lotes.map(lote => lote.quantity).reduce((a,b) => a + b, 0)
      this.productData.detalle = this.lotes
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/recepcion-sap'])
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
