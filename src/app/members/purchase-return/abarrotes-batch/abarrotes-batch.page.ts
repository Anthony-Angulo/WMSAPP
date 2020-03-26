import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NavExtrasService } from 'src/app/services/nav-extras.service';

@Component({
  selector: 'app-abarrotes-batch',
  templateUrl: './abarrotes-batch.page.html',
  styleUrls: ['./abarrotes-batch.page.scss'],
})
export class AbarrotesBatchPage implements OnInit {

  productData: any
  cantidad: number
  lotes = []
  lote: any
  batch: any;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private navExtras: NavExtrasService
  ) { }

  ngOnInit() {

    this.productData = this.navExtras.getProducts();

    if (this.productData.count) {
      this.cantidad = this.productData.count
    }

    if (!this.productData.detalle) {
      this.productData.detalle = []
    } else {
      this.lotes = this.productData.detalle
    }

    this.http.get(environment.apiSAP +  '/api/batch/' + this.productData.WhsCod
    + '/' +  this.productData.Detail.ItemCode).toPromise().then((data) => {
      console.log(data)
      this.batch = data
    }).catch(() => {
      this.presentToast('Error al traer lotes de producto','danger')
    })

  }

  eliminar(index) {
    this.lotes.splice(index, 1)
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      color: color,
      duration: 4000
    });
    toast.present();
  }

}
