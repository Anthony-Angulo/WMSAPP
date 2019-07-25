import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
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

  constructor(private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private storage: Storage) { }

  ngOnInit() {
  }

  searchCM(e) {
    this.http.get(environment.apiWMS + '/codeBarFromInventory/' + e.target.value)
      .subscribe((data: any) => {
        this.product = data.product[0];
        console.log(this.product);
      }, error => {
        this.presentToast('Codigo Incorrecto', 'danger');
      });
  }

  ubicarTarima() {

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
                this.router.navigate(['/members/home']);
              }, error => {
                console.log(error);
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
                this.presentToast('Se guardo tarima satisfactoriamente', 'success');
                this.router.navigate(['/members/home']);
              }, error => {
                console.log(error);
              });
            } else {
              this.presentToast('La posicion ya contiene una tarima', 'danger');
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
}
