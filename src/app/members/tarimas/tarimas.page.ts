import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Storage } from '@ionic/storage';

const SUCURSAL_KEY = '0';

@Component({
  selector: 'app-tarimas',
  templateUrl: './tarimas.page.html',
  styleUrls: ['./tarimas.page.scss'],
})
export class TarimasPage implements OnInit {

  codeBar: any;
  product: any;
  cantidad: number = 0;
  code: any;
  lote: any;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private storage: Storage) { }

  ngOnInit() {
  }


  searchProduct() {

    this.storage.get(SUCURSAL_KEY).then(val => {
      this.http.get(environment.apiWMS + '/codeBarFromInventory/' + this.codeBar + '/' + val).toPromise().then((data: any) => {
        if (!data) {
          this.presentToast('No se encontro codigo de caja', 'warning')
        } else {
          console.log(data)
          this.product = data;
          this.lote = this.product.maneja_lote;
        }
      })
    })

  }

  armarTarima() {
    if (this.cantidad != 0) {

      this.product.cantidad = this.cantidad

      let body = {
        'producto': this.product,
      }

      this.http.post(environment.apiWMS + '/saveTarima', body).subscribe(val => {
        this.presentToast('Se Creo Tarima Satisfactoriamente', 'success');
        this.router.navigate(['/members/home']);
      }, error => {
        this.presentToast('Error al guardar. Vuelva a Intentarlo', 'danger')
      });

    } else {
      this.presentToast('Ingresa una cantidad para continuar.', 'warning')
    }


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
}
