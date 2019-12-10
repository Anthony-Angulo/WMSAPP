import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-products-sap',
  templateUrl: './products-sap.page.html',
  styleUrls: ['./products-sap.page.scss'],
})
export class ProductsSapPage implements OnInit {

  load: any;
  number: any
  inventory: any
  
  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,
  ) { }

  ngOnInit() {
  }

  getProducto(){
    this.presentLoading('Buscando...')

    this.http.get(environment.apiSAP + '/api/products/' + this.number).toPromise().then((resp: any) => {
      console.log(resp)
      this.inventory = resp
    }).catch((error) => {
      this.presentToast(error.error.error,'danger')
    }).finally(() => {
      this.hideLoading()
    })
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
