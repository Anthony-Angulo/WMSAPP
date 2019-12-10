import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';

@Component({
  selector: 'app-abarrotes',
  templateUrl: './abarrotes.page.html',
  styleUrls: ['./abarrotes.page.scss'],
})
export class AbarrotesPage implements OnInit {

  productData: any
  cantidad: number = 0

  constructor(
    private toastController: ToastController,
    private router: Router,
    private receptionService: RecepcionDataService) { }

  ngOnInit() {
    this.productData= this.receptionService.getOrderData()
    if(this.productData.count){
      this.cantidad = this.productData.count
    }
  }

  acceptRecepton(){
    if(this.productData.count != 0 && this.cantidad == 0){
      console.log(1)
      this.productData.count = this.cantidad
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/transferencia-sap'])
      return
    } else if (this.cantidad <= 0){
      this.presentToast('Debe igresar una cantidad valida','warning')
      return
    } else {
      this.productData.count = this.cantidad
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/transferencia-sap'])
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
