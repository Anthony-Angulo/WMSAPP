import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-recepcion',
  templateUrl: './recepcion.page.html',
  styleUrls: ['./recepcion.page.scss'],
})
export class RecepcionPage implements OnInit {

  url = 'http://192.168.101.123'
  number: number;
  productsList: any = [];
  proveedorData: any;
  codigoBarra: string = '';

  constructor(private http: HttpClient,
    private barcodeScanner: BarcodeScanner,
    private toastController: ToastController) { }

  ngOnInit() {
  }

  public getOrden() {
    this.http.get(this.url + '/api/ordenDeCompras/' + this.number + '/' + 1)
      .subscribe((data: any) => {
        this.productsList = data.orders;
        this.productsList.forEach(element => {
          element.count = 0;
        });
        this.proveedorData = data.proveedor;
        console.log(data);
      });
  }

  public scannProduct(val: any) {
    let valor = val.target.value;
    if (valor != '') {
      let product_index = this.productsList.findIndex(product => product.produto == valor)
      if (product_index >= 0) {
        this.productsList[product_index].count += 1
      } else {
        this.presentToast();
      }
      this.codigoBarra = '';
    }
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'El codigo no coincide con ningun producto.',
      duration: 2000
    });
    toast.present();
  }

}
