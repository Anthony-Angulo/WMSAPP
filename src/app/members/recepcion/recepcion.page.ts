import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-recepcion',
  templateUrl: './recepcion.page.html',
  styleUrls: ['./recepcion.page.scss'],
})
export class RecepcionPage implements OnInit {

  number: number;
  productsList: any = [];
  proveedorData: any;
  orderData: any;
  scannedProductsList: any = [];
  scannedBeefList: any = [];
  total_orden: number = 0;


  constructor(
    private http: HttpClient,
    private barcodeScanner: BarcodeScanner,
    private navExtras: NavExtrasService,
    private toastController: ToastController,
    private router: Router) { }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.navExtras.setOrderData(null)
    this.navExtras.setScannedProducts(null)
  }

  ionViewWillEnter() {

    let productsScanned = this.navExtras.getScannedProducts();

    if (productsScanned != null) {
      let index = this.productsList.findIndex(product => { return product.codigoProtevs == productsScanned.codigo_prothevs });

      if (index >= 0) {
        this.productsList[index] = productsScanned;
      }
    }

    this.navExtras.setScannedProducts(null);
  }

  public getOrden() {

    this.http.get(environment.apiProtevs + '/api/ordenDeCompras/' + this.number + '/' + 1)
      .subscribe((data: any) => {

        this.productsList = data.detalle;
        this.proveedorData = data.proveedor;
        this.orderData = data.encabezado;

        let codes = [];

        this.productsList.forEach((element) => {
          codes.push(element.codigo_prothevs);
        });

        this.http.get(environment.apiWMS + '/getLoteNeed/' + codes).subscribe((data: any[]) => {
          this.productsList.map(x => Object.assign(x, data.find(y => y.codigoProtevs == x.codigo_prothevs)))
          this.productsList.forEach((element) => {
            element.needLote = Number(element.maneja_lote)
          })
        });
      });
  }

  goToProduct(index: number) {

    this.navExtras
      .setOrderData(this.productsList[index]);

    this.router.navigate(['/members/scannproducts']);
  }

  recibirProductos() {

    let registros = [];

    let products = this.productsList.filter(product => { return product.detalle != null });

    products.forEach(element => {
      registros = registros.concat(element.detalle);
    });

    let enviar = {
      products: registros
    }

    this.http.post(environment.apiWMS + '/TempRecepcion', enviar).subscribe(response => {
      this.presentToast('Recepcion Satisfactoria.');
      this.router.navigate(['/members/home']);
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
