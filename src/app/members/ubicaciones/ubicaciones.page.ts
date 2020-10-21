import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Storage } from '@ionic/storage';

const SUCURSAL_KEY = '0';

@Component({
  selector: 'app-ubicaciones',
  templateUrl: './ubicaciones.page.html',
  styleUrls: ['./ubicaciones.page.scss'],
})
export class UbicacionesPage implements OnInit {

  rackCode: any
  tarimaInfo: any
  load: any

  constructor(private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private storage: Storage,
    private loading: LoadingController) { }

  ngOnInit() {
  }

  findLocation(event) {
    this.presentLoading('Buscando...')

    this.rackCode = event.target.value

    let newstr = this.rackCode.split("-")

    this.storage.get(SUCURSAL_KEY).then(sucursal => {
      this.http.get(environment.apiWMS + '/findLocation/' + sucursal + '/' + newstr[0] + '/' + newstr[1]
        + '/' + newstr[2] + '/' + newstr[3] + '/' + newstr[4]).toPromise().then((resp: any) => {
          this.tarimaInfo = resp
          console.log(this.tarimaInfo)
        }).catch(() => {
          this.presentToast('Error al buscar. Vuelva a intentar', 'danger')
        }).finally(() => {
          this.hideLoading()
        })
    })
  }

  deleteMasterFromLocation() {

    this.presentLoading('Eliminando..')

    this.http.get(environment.apiWMS + '/deleteMasterFromLocation/' + this.tarimaInfo.codigobarras_master)
      .toPromise().then(() => {
        this.presentToast('Se quio tarima de ubicacion', 'success')
        this.router.navigate(['/members/home'])
      }).catch(() => {
        this.presentToast('Error al eliminar. Vuelva a intentar', 'warning')
      }).finally(() => {
        this.hideLoading()
      })
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      position: "bottom",
      color: color,
      duration: 2500
    });
    toast.present();
  }

  async presentLoading(msg: string) {
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
