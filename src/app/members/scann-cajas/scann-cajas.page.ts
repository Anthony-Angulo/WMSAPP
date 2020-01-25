import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController , LoadingController} from '@ionic/angular';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Storage } from '@ionic/storage';

const SUCURSAL_KEY = '0';

@Component({
  selector: 'app-scann-cajas',
  templateUrl: './scann-cajas.page.html',
  styleUrls: ['./scann-cajas.page.scss'],
})
export class ScannCajasPage implements OnInit {

  
  load: any
  number: any
  product: any
  uomentry
  Cb
  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,
    private storage: Storage) { }

  ngOnInit() {
  }

  async getProducto() {

    await this.presentLoading('Buscando...')

    this.http.get(environment.apiSAP + '/api/products/crm/' + this.number.toUpperCase()).toPromise().then((resp:any) => {
      this.product = resp
      console.log(this.product)
    }).catch((error) => {
      console.log(error)
      this.presentToast('Error al obtener producto','danger')
    }).finally(() => {
      this.hideLoading()
    })
    
  }

  async registerBox() {

    await this.presentLoading('Guardando codigo..')

    let data = {
      itemcode: this.product.products.ItemCode,
      barcode: this.Cb,
      uomentry: this.uomentry
    }

    this.http.post(environment.apiSAP + '/api/codebar', data).toPromise().then((resp) => {
      if(resp){
        this.router.navigate(['/members/home'])
        this.presentToast('Se guardo exitosamente','success')
      } 
    }).catch((error) => {
      console.log(error)
      this.presentToast(error.error.error,'danger')
    }).finally(() => {
      this.hideLoading()
    })
    
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

  async presentLoading(msg) {
    this.load = await this.loading.create({
      message: msg,
      duration: 3000
    });

    await this.load.present()
  }

  hideLoading() {
    console.log('loading')
    this.load.dismiss()
  }


}
