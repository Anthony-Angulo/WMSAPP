import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { NavExtrasService } from 'src/app/services/nav-extras.service';

@Component({
  selector: 'app-scannproducts',
  templateUrl: './scannproducts.page.html',
  styleUrls: ['./scannproducts.page.scss'],
})

export class ScannproductsPage implements OnInit {

  productData: any;
  codigoBarra: any = '';
  cantidad: number = 0;
  cantidadTemp: number = 0;
  scannedProducts: any = [];
  productTable: any = [];
  lote: string = '';

  constructor(
    private navExtras: NavExtrasService,
    private toastController: ToastController,
    private router: Router) { }

  ngOnInit() {
    this.productData = this.navExtras.getOrderData();
    if (!this.productData.detalle) this.productData.detalle = [];
  }

  public scannProduct() {
    if (this.codigoBarra != '' && this.cantidad != 0) {
      let index = this.productData.detalle.findIndex(product => product.codigobarras == this.codigoBarra);
      if (index < 0) {
        this.productData.detalle.push({
          orden_compra: this.productData.num,
          codigo_protehus: this.productData.codigo_prothevs,
          cantidad: this.cantidad,
          codigobarras: this.codigoBarra,
          lote: this.lote,
          sucursal_id: 1
        });
      } else {
        this.productData.detalle[index].cantidad += this.cantidad;
      }
      this.codigoBarra = '';
      this.cantidad = 0;
    } else {
      this.presentToast("Ingresa primero un codigo y/o cantidad");
    }
  }

  public eliminarRegistro(index) {
    this.productData.detalle.splice(index, 1);
  }

  public receptionProducts() {

    if (this.productData.detalle.length == 0) {
      delete this.productData.detalle
      delete this.productData.count
    } else {
      this.productData.count = 0;
      this.productData.detalle.forEach(element => {
        this.productData.count += element.cantidad;
      });
    }

    this.navExtras.setScannedProducts(this.productData);

    this.router.navigate(['/members/recepcion']);
  }


  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }
}
