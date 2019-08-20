import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
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

  barcode: string;
  boxCodeBar: string;
  product: any;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private storage: Storage) { }

  ngOnInit() {
  }

  getProduct(event) {
    this.storage.get(SUCURSAL_KEY).then(value => {
      return this.http.get(environment.apiWMS + '/getProduct/' + event.target.value + '/' + value).toPromise()
    }).then((data: any) => {
      if (data.exists != 0) {
        this.presentToast('El producto ya fue registrado', 'danger')
      } else if (!data.product) {
        this.http.get(environment.apiProtevs + '/api/getProductByCodeBar/' + event.target.value).toPromise().then((datos: any) => {
          if (datos.codigoBarraSLK != null) {
            this.product = datos.codigoBarraSLK
          } else {
            this.product = datos.codigoBarraSB1
          }
        })
      } else {
        this.product = data.product
      }
    }).catch(error => {
      console.log(error)
    }).finally(() => {

    })

  }

  registerBox() {

    if (this.boxCodeBar == undefined) {
      this.presentToast('Debe ingresar un codigo de caja.', 'danger')
    } else {
      let body = {
        um: this.product.UM_mayoreo,
        codeprotevs: this.product.codigoProtevs,
        codebox: this.boxCodeBar
      }

      this.http.post(environment.apiWMS + '/registerbox', body).toPromise().then((data: any) => {
        this.product = undefined
        this.barcode = ''
        this.boxCodeBar = ''

        this.presentToast('Se registro codigo de caja.', 'success')
      }, error => {
        this.presentToast('Hubo un error. Intentar de nuevo', 'danger')
      })
    }
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


}
