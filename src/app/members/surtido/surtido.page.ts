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
      let index = this.order.rows.findIndex(product => { return product.codigoProtevs == productSurtido.codigo_protehus })
      if (index >= 0) {
        this.order.detalle[index] = productSurtido
      }
    }
    this.navExtras.setSurtidoProduct(null)
  }

  getOrden() {

    this.storage.get(SUCURSAL_KEY).then(sucursal => {
      this.http.get(environment.apiCRM + '/getOrderByOrderNumber/' + this.number + '/' + sucursal).toPromise().then((data: any) => {
        this.order = data
        console.log(this.order)
        return this.order.rows.map(x => x.codigoProtevs)
      }).then(codes => {
        return this.http.get(environment.apiWMS + '/getCodeBarsEmbarques/' + codes).toPromise()
      }).then((codeBars: any[]) => {
        console.log(codeBars)

        this.order.rows.map(product => {
          let find = codeBars.find(y => y.codigoProtevs == product.codigoProtevs)
          if (find) {
            product.codigoBarras = find.codigoBarras
          } else {
            product.codigoBarras = ''
          }

        })
        console.log(this.order)
      }).catch(error => {
        console.log(error)
      }).finally(() => { })
    })
  }

  goToProduct(index: number) {
    if (this.order.rows[index].product_type_id == 3) {
      this.order.rows[index].pedido_id = this.order.order.order_id
      this.navExtras.setSurtidoDetail(this.order.rows[index])
      this.router.navigate(['/members/surtido-beef'])
    } else {
      this.order.rows[index].pedido_id = this.order.order.order_id
      this.navExtras.setSurtidoDetail(this.order.rows[index])
      this.router.navigate(['/members/surtido-abarrotes'])
    }
  }

  enviarProductos() {
    this.presentLoading('Surtiendo...')

    let pro = []

    this.order.rows.forEach(product => {
      if (product.detalle) pro = pro.concat(product.detalle)
    })

    let enviar = {
      products: pro
    }

    this.http.post(environment.apiWMS + '/saveEmbarque', enviar).toPromise().then((resp: any) => {
      if (resp.success) {
        this.presentToast('Se surtio satisfactoriamente', 'success')
        this.router.navigate(['/members/home']);
      }
    }).catch(error => {
      console.log(error)
      this.presentToast('Error al surtir. Vuelva a intentarlo', 'danger')
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
