import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-surtido-abarrotes',
  templateUrl: './surtido-abarrotes.page.html',
  styleUrls: ['./surtido-abarrotes.page.scss'],
})
export class SurtidoAbarrotesPage implements OnInit {

  productInfo: any
  modo: boolean = false
  codeExist: boolean
  cantidad: number = 0
  eventCodeBar: any

  constructor(
    private http: HttpClient,
    private navExtras: NavExtrasService,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,
    private storage: Storage
  ) { }

  ngOnInit() {
    this.productInfo = this.navExtras.getSurtidoDetail()
    this.cantidad = this.productInfo.count
  }


  surtirProducts() {
    
    if(this.cantidad == 0) {
      this.router.navigate(['/members/surtido']);
      return
    }

    let productToSend

    if(this.cantidad != undefined){
      productToSend = {
        count: this.cantidad,
        Line: this.productInfo.LineNum
      }
    this.navExtras.setSurtidoProduct(productToSend)
    this.router.navigate(['/members/surtido']);
    }
    
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      color: color,
      duration: 2000
    });
    toast.present();
  }



}
