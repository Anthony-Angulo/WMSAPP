import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { LoadingController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';

const URL = 'http://192.168.101.123'

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.page.html',
  styleUrls: ['./delivery.page.scss'],
})
export class DeliveryPage implements OnInit {

  constructor(private storage: Storage, private http: HttpClient, public loadingController: LoadingController) { }

  ngOnInit() {
  }

  async scan() {
    const loading = await this.loadingController.create({
      message: 'Obteniendo Datos...',
    });
    await loading.present();

    this.http.get(URL + '/api/getBarcode/' + 1).pipe(
      finalize(() => {
        loading.dismiss();
      })
    ).subscribe((data: any) => {

      this.storage.get('bar').then(barList => {

        if (barList) {
          barList.push(data);
          this.storage.set('bar', barList);
        } else {
          this.storage.set('bar', [data]);
        }

      });

    });
  }

}
