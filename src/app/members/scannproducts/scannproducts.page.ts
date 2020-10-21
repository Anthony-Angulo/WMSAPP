import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { TarimasModalPage } from '../tarimas-modal/tarimas-modal.page';


@Component({
  selector: 'app-scannproducts',
  templateUrl: './scannproducts.page.html',
  styleUrls: ['./scannproducts.page.scss'],
})

export class ScannproductsPage implements OnInit {

  productData: any;
  cantidad: number;
  fechaCad: Date;
  productLote: any = []
  lote: any;

  constructor(
    private http: HttpClient,
    private navExtras: NavExtrasService,
    private toastController: ToastController,
    private router: Router,
    private modalController: ModalController) { }

  ngOnInit() {
    this.productData = this.navExtras.getOrderData();
    console.log(this.productData)
    this.cantidad = this.productData.count
  }

  addLote(){
    if(this.cantidad != 0){
      this.productLote.push({
        count: this.cantidad,
        fechaCad: this.fechaCad,
        Lote: this.lote
      });
      console.log(this.productLote)
    }else{
      this.presentToast('Debe ingresar una cantidad primero.','warning')
    }
  }

  acceptRecepton(){
    let productToRecieve 
    if(this.cantidad != 0){
      productToRecieve = {
        count: this.cantidad,
        Line: this.productData.LineNum
      }
      this.navExtras.setScannedProducts(productToRecieve);
      this.router.navigate(['/members/recepcion-sap']);
    }else{
      this.presentToast('Debe ingresar una cantidad primero.','warning')
    }
    
  }

 
  async openModal() {
    const modal = await this.modalController.create({
      component: TarimasModalPage,
      componentProps: {
        "data": this.productData,
      }
    });

    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        this.productData = dataReturned.data.productData
        console.log(this.productData)
      }
    });

    return await modal.present();
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


