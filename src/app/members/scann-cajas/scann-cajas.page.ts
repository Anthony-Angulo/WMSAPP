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

  barcode: string;
  boxCodeBar: string;
  barcodeProd: string;
  exibision: string;
  product: any;
  codProt: string;
  showInputs: boolean = true;
  load: any;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,
    private storage: Storage) { }

  ngOnInit() {
  }

  getProduct() {

    this.presentLoading('Buscando product..')

    if(this.barcode != undefined){
      this.storage.get(SUCURSAL_KEY).then(value => {
        return this.http.get(environment.apiWMS + '/getProduct/' + this.barcode+  '/' + value).toPromise()
      }).then((data: any) => {
        if (!data.product) {
          this.http.get(environment.apiProtevs + '/api/getProductByCodeBar/' + this.barcode).toPromise().then((datos: any) => {
            if (datos.codigoBarraSLK != null) {
              this.product = datos.codigoBarraSLK
              this.showInputs = false
            } else {
              this.showInputs = false
              this.product = datos.codigoBarraSB1
            }
          })
        } else {
          this.showInputs = false
          this.product = data.product
        }
      }).catch(error => {
        console.log(error)
      }).finally(() => {
        this.hideLoading()
      })
    }else{
      this.storage.get(SUCURSAL_KEY).then(sucursalId => {
        return this.http.get(environment.apiWMS +'/getProductByCodeProt/' + this.codProt +'/' + sucursalId).toPromise()
      }).then((data: any) => {
        this.showInputs = false
        this.product = data
      }).catch(() => {
        this.presentToast('Hubo un error al buscar producto','danger')
      })
    }
  }

  registerBox() {

    this.presentLoading('Guardando codigo..')

    if (this.boxCodeBar == undefined) {
      this.presentToast('Debe ingresar un codigo de caja.', 'danger')
      this.hideLoading()
    } else {
      let body = {
        um: this.product.UM_mayoreo,
        codeprotevs: this.product.codigoProtevs,
        codebox: this.boxCodeBar,
        exibision: this.exibision
      }

      this.http.post(environment.apiWMS + '/registerbox', body).toPromise().then((data: any) => {
        this.product = undefined
        this.barcode = ''
        this.boxCodeBar = ''
        this.exibision = ''

        this.presentToast('Se registro codigo de caja.', 'success')
        this.router.navigate(['/members/home']);
      }, error => {
        this.presentToast('Hubo un error. Intentar de nuevo', 'danger')
      }).finally(() => {
        this.hideLoading()
      })
    }
  }

  registerSingleItemCodeBar(){

    this.presentLoading('Guardando codigo..')

    if(this.barcodeProd == undefined || this.barcodeProd == ''){
      this.presentToast('Debe ingresar un codigo de barra.','warning')
    }else{
      let body = {
        um: '',
        exibision: '',
        codeprotevs: this.product.codigoProtevs,
        codebox: this.barcodeProd
      }

      this.http.post(environment.apiWMS + '/registerbox', body).toPromise().then((data: any) => {
        if(data.success){
          this.presentToast('Se guardo correctamente','success')
          this.router.navigate(['/members/home']);
        }
      }).catch((error) => {
        this.presentToast('Error al guardar. Intentalo de nuevo','danger')
        console.log(error)
      }).finally(() => {
        this.hideLoading()
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
