import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';
import { NavParams } from '@ionic/angular';

const SUCURSAL_KEY = '0';

@Component({
  selector: 'app-tarimas-modal',
  templateUrl: './tarimas-modal.page.html',
  styleUrls: ['./tarimas-modal.page.scss'],
  providers: [DatePipe]
})



export class TarimasModalPage implements OnInit {

  @Input() data: [];

  product: any;
  codeBar: any;
  cantidad: number;
  productTarima: any;
  fecha_caducidad: Date = new Date();

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private toastController: ToastController,
    private http: HttpClient,
    private storage: Storage,
    private datePipe: DatePipe) { }

  ngOnInit() {
    this.product = this.navParams.get('data');

    if (!this.product.tarimas) this.product.tarimas = [];

    console.log(this.product);

    this.codeBar = this.product.codbarSB;
  }

  armarTarima() {

    this.storage.get(SUCURSAL_KEY).then(val => {
      this.http.get(environment.apiWMS + '/codeBarFromInventory/' + this.codeBar + '/' + val).toPromise().then((resp: any) => {
        if (!resp) {
          this.presentToast('Error al generar tarima', 'warning')
        } else {
          let productTarima = resp
          productTarima.cantidad = this.cantidad
          productTarima.fecha_caducidad = this.datePipe.transform(this.fecha_caducidad, 'yyyy-MM-dd')

          console.log(productTarima)

          let body = {
            'products': [
              productTarima,
            ]
          };

          this.http.post(environment.apiWMS + '/saveTarima', body).subscribe((val: any) => {

            this.product.tarimas.push({
              codigo_master: val.codigo_master,
              cantidad: this.cantidad
            });

            this.presentToast('Se Creo Tarima Satisfactoriamente', 'success');
            this.closeModal(this.product);
          }, error => {
            console.log(error);
          });
        }
      })
    })

  }

  async closeModal(tarimas) {
    this.modalController.dismiss({
      'productData': tarimas
    });
  }

  async closeModalCancel() {
    this.modalController.dismiss()
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
