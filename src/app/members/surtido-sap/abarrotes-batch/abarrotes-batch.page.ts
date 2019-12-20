import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

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
  loteselect
  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
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

    this.http.get(environment.apiSAP + '/api/batch/' + this.productData.WhsCode + '/' +  this.productData.ItemCode).toPromise().then((data) => {
      console.log(data)
      this.batch = data
    }).catch(() => {
      this.presentToast('Error al traer lotes de producto','danger')
    })
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
      quantity: Math.floor(Number(Number(this.cantidad * this.productData.Detail.U_IL_PesProm).toFixedNoRounding(4))),
      code: '',
      att1: '',
      pedimento: ''
    }) 

    
  }

  eliminar(index){
    this.lotes.splice(index,1)
  }

  acceptRecepton(){
    
    if(this.productData.count != 0 && this.cantidad == 0){
      this.productData.count = this.cantidad
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/surtido-sap'])
    } else if(this.cantidad <= 0){
      this.presentToast('Debe igresar una cantidad valida','warning')
      return
    } else if(this.productData.Detail.QryGroup41 == 'Y'){
      this.productData.count = this.cantidad
      this.productData.detalle = this.lotes
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/surtido-sap'])
    } else {
      this.productData.count = this.lotes.map(lote => lote.quantity).reduce((a,b) => a + b, 0)
      this.productData.detalle = this.lotes
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
