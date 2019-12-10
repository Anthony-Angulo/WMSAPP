import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { ToastController, LoadingController } from '@ionic/angular';

const SUCURSAL_KEY = '0';

@Component({
  selector: 'app-surtido',
  templateUrl: './surtido.page.html',
  styleUrls: ['./surtido.page.scss'],
})
export class SurtidoPage implements OnInit {

  number: number;
  order: any;
  load: any;
  products: any = []

  constructor(
    private http: HttpClient,
    private navExtras: NavExtrasService,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,
    private storage: Storage
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    let productSurtido = this.navExtras.getSurtidoProduct()

    if (productSurtido != null) {
      let index = this.order.RDR1.findIndex(product => product.LineNum == productSurtido.Line )
      if (index >= 0) {
        this.order.RDR1[index].count = productSurtido.count
        this.products.push(productSurtido)
      }
    }
    this.navExtras.setSurtidoProduct(null)
  }

  getOrden() {
      this.presentLoading('Buscando....')
      this.http.get(environment.apiSAP + '/api/order/Delivery/' + this.number).toPromise().then((data: any) =>{
        this.order = data;
        console.log(this.order)
      }).catch(error => {
        console.log(error)
      }).finally(() => {
        this.hideLoading()
      })
  }

  goToProduct(index: number) {
    this.navExtras.setSurtidoDetail(this.order.RDR1[index])
    this.router.navigate(['/members/surtido-abarrotes'])
  }

  enviarProductos() {

    this.presentLoading('Surtiendo...')

    let order = {
      order: this.order.ORDR.DocEntry,
      products: this.products
    }

    this.http.post(environment.apiSAP + '/api/Delivery', order).toPromise().then((resp) => {
      if(resp){
        this.presentToast('Se surtio correctamente','success')
        this.router.navigate(['/members/home'])
      }
    }).catch(error =>{
      console.log(error)
      this.presentToast('Error al recepcionar. Intenta de nuevo.','danger')
    }).finally(() => {
      this.hideLoading()
    })
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      position: "bottom",
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
