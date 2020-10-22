import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController , LoadingController, AlertController} from '@ionic/angular';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Platform } from '@ionic/angular';
import { SettingsService } from './../../services/settings.service';
import { getSettingsFileData } from '../commons';


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
  public appSettings: any;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,
    private alertController: AlertController,
    private platform: Platform,
    private setting: SettingsService) { }

  ngOnInit() {
    this.appSettings = getSettingsFileData(this.platform, this.setting);
  }

  async getProducto() {

    await this.presentLoading('Buscando...')

    this.http.get(`${this.appSettings.apiSAP}/api/products/crm/${this.number.toUpperCase()}`).toPromise().then((resp:any) => {
      this.product = resp
    }).catch((error) => {
      console.log(error)
      this.presentToast('Error al obtener producto','danger')
    }).finally(() => {
      this.hideLoading()
    })
    
  }

  async registerBox() {

    await this.presentLoading('Guardando codigo..')

    this.http.get(`${this.appSettings.apiSAP}/api/Codebar/${this.Cb}`).toPromise().then((resp: any) => {
      if(resp != null){
        this.presentAlert(resp.Detail.ItemCode)
      } else {
        
        let data = {
          ItemCode: this.product.products.ItemCode,
          Barcode : this.Cb,
          UOMEntry: this.uomentry
        }
    
        this.http.post(`${environment.apiSAP}/api/Codebar`, data).toPromise().then((resp) => {
          if(resp){
            this.router.navigate(['/members/home'])
            this.presentToast('Se guardo exitosamente','success')
          } 
        }).catch((error) => {
          if(error.status == 404){
            this.presentToast("Este codigo de barra ya existe para este producto","warning")
          } else {
            this.presentToast(error.error,"danger")
          }
        }).finally(() => {
          this.hideLoading()
        })
      }
    }).catch(error => {
        this.presentToast(error.statusText,"danger")
    }).finally(() => { this.hideLoading() })

    
    
  }

  async presentAlert(ItemCode: string) {
    const alert = await this.alertController.create({
      header: 'Codigo de barra Existente',
      subHeader: '',
      message: 'Este codigo de barra ya existe en el producto ' + ItemCode,
      buttons: ['OK']
    });

    await alert.present();
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
