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
  cantidad: number;
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
      this.http.get(environment.apiWMS + '/codeBarFromInventory/' + this.codeBar + '/' + val)
        .subscribe((data: any) => {
          this.product = data.product[0];
          console.log(this.product);
          this.code = this.product.codigoProtevs;
          this.lote = this.product.maneja_lote;
        });
    })

  }

  armarTarima() {

    let body = {
      'producto': this.product,
      'cantidad': this.cantidad
    }

    this.http.post(environment.apiWMS + '/saveTarima', body).subscribe(val => {
      this.presentToast('Se Creo Tarima Satisfactoriamente');
      this.router.navigate(['/members/home']);
    }, error => {
      console.log(error);
    });

  }

  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      position: "middle",
      color: "success",
      duration: 2000
    });
    toast.present();
  }
}
