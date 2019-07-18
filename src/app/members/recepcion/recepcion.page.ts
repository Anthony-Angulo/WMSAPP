import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
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
    private router: Router) { }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.navExtras.setExtras(null)
    this.navExtras.setScannedProducts(null)
  }

  ionViewWillEnter() {

    let scannedBeef = this.navExtras.getScannedBeef();
    let scannedProduct = this.navExtras.getScannedProducts();
    let dataTot = this.navExtras.getScannedCodeAndTotal();

    if (scannedBeef != null) {
      let index = this.productsList.findIndex(product => product.codigo_prothevs == dataTot.codigo_prot)
      if (index < 0) {
        console.log("error: no se encuantra el codigo")
      } else {
        this.productsList[index].count = dataTot.total;
        this.scannedProductsList.push(scannedBeef);
      }

      console.log(this.scannedProductsList);

      this.navExtras.setScannedBeef(null);
      this.navExtras.setScannedCodeAndTotal(null);

    } else {
      if (scannedProduct != null) {

        let index = this.productsList.findIndex(product => product.codigo_prothevs == scannedProduct.codigo)

        if (index < 0) {
          console.log("error: no se encuantra el codigo")
        } else {
          this.productsList[index].count = scannedProduct.cantidad
          this.scannedProductsList.push(this.productsList[index]);
        }

        this.navExtras.setScannedProducts(null);
      }
    }
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
          this.productsList.forEach((element) => {
            let valor = data.find(product => { return product.codigoProtevs == element.codigo_prothevs })
            element.needLote = Number(valor.maneja_lote);
          })
        });
      });
  }

  setDatos() {
    const myData = {
      products: this.productsList,
      orderData: this.orderData,
    }
    this.navExtras.setExtras(myData);
    console.log(myData);
  }

  goToProduct(id) {
    this.navExtras.setScannedProducts(id);
    this.setDatos()
    this.router.navigate(['/members/scannproducts']);
  }


  recibirProductos() {

    const recepcionData = {
      'order_encabezado': this.orderData.orden_compra,
      'scanned_products': this.scannedProductsList
    };

    console.log(recepcionData);

    this.http.post(environment.apiWMS + '/TempRecepcion', recepcionData).subscribe((data: any) => {
      console.log(data);
    });

  }
}
