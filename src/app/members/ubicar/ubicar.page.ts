import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Storage } from '@ionic/storage';

const SUCURSAL_KEY = '0';
const USER_ID = '1';

@Component({
  selector: 'app-ubicar',
  templateUrl: './ubicar.page.html',
  styleUrls: ['./ubicar.page.scss'],
})
export class UbicarPage implements OnInit {

  masterTarima: any;
  codeRack: any;
  product: any;
  locationData: any = [];
  load: any;

  constructor(private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private storage: Storage,
    private loading: LoadingController) { }

  ngOnInit() {
  }

  searchCM(e) {

    this.presentLoading('Buscando Producto...')

    this.http.get(environment.apiWMS + '/codeBarFromInventory/' + e.target.value)
      .subscribe((data: any) => {

        if (data.product.length == 1) {
          this.product = data.product[0];
        } else {
          this.product = data.product[0];
          this.product.cantidad = data.product.length
        }
        this.hideLoading()
      }, error => {
        this.hideLoading()
        this.presentToast('Codigo Incorrecto', 'danger');
      });
  }

  ubicarTarima() {

    this.presentLoading('Guardando Tarima...')

    let newstr = this.codeRack.split("-");

    this.storage.get(SUCURSAL_KEY).then(sucursal => {
      this.storage.get(USER_ID).then(user_id => {

        this.http.get(
          environment.apiWMS + '/validateLocation/' + sucursal + '/' + newstr[0] + '/' + newstr[1] + '/' + newstr[2] + '/' + newstr[3] + '/' + newstr[4])
          .subscribe((data: any) => {
            if (!data.result) {
              let newLocation = {
                band: true,
                codigoBarraMaster: this.masterTarima,
                codigoBarra: this.product.codigoBarras,
                sucursal: sucursal,
                user_id: user_id,
                subalmacen: newstr[0],
                rack: newstr[1],
                nivel: newstr[2],
                division: newstr[3],
                posicion: newstr[4]
              }

              this.http.post(environment.apiWMS + '/saveOrUpdateLocation', newLocation).subscribe(data => {
                this.presentToast('Se guardo tarima satisfactoriamente', 'success');
                this.hideLoading()
                this.router.navigate(['/members/home']);
              }, error => {
                this.presentToast('Error al guardar tarima. Vuelva a Intentarlo', 'danger')
                this.hideLoading()
              });


            } else if (data.result.codigobarras_master == '') {

              let updateData = {
                band: false,
                codigoBarraMaster: this.masterTarima,
                codigoBarra: this.product.codigoBarras,
                sucursal: sucursal,
                user_id: user_id,
                subalmacen: newstr[0],
                rack: newstr[1],
                nivel: newstr[2],
                division: newstr[3],
                posicion: newstr[4]
              }

              this.http.post(environment.apiWMS + '/saveOrUpdateLocation', updateData).subscribe(data => {
                this.hideLoading()
                this.presentToast('Se guardo tarima satisfactoriamente', 'success');
                this.router.navigate(['/members/home']);
              }, error => {
                this.presentToast('Error al Guardar Tarima. Vuelva a Intentarlo', 'danger')
              });
            } else {
              this.hideLoading()
              this.presentToast('La posicion ya contiene una tarima', 'warning');
            }
          });
      });
    });
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
