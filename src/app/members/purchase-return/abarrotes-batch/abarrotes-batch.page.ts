import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { SettingsService } from '../../../services/settings.service';
import { getSettingsFileData } from '../../commons';
import { Platform } from '@ionic/angular';


@Component({
  selector: 'app-abarrotes-batch',
  templateUrl: './abarrotes-batch.page.html',
  styleUrls: ['./abarrotes-batch.page.scss'],
})
export class AbarrotesBatchPage implements OnInit {

  public appSettings: any;

  productData: any
  cantidad: number
  lotes = []
  lote: any
  batch: any;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private navExtras: NavExtrasService,
    private platform: Platform,
    private settings: SettingsService
  ) { }

  ngOnInit() {

    this.productData = this.navExtras.getProducts();

    this.appSettings = getSettingsFileData(this.platform, this.settings);


    if (this.productData.count) {
      this.cantidad = this.productData.count
    }

    if (!this.productData.detalle) {
      this.productData.detalle = []
    } else {
      this.lotes = this.productData.detalle
    }

    this.http.get(`${this.appSettings.apiSAP}/api/batch/${this.productData.WhsCode}/${this.productData.Detail.ItemCode}`).toPromise().then((data) => {
      console.log(data)
      this.batch = data
    }).catch(() => {
      this.presentToast('Error al traer lotes de producto','danger')
    })

  }

  eliminar(index) {
    this.lotes.splice(index, 1)
  }

  public addLote(): void{
    if (this.cantidad <= 0 || this.lote == undefined || this.lote == '') {
      this.presentToast('Datos faltantes', 'warning')
      return
    } else {
      this.lotes.push({
        name: this.lote,
        expirationDate: '11-22-2019',
        quantity: Number(Number(this.cantidad * this.productData.Detail.NumInSale).toFixedNoRounding(4)),
        code: '',
        att1: '',
        pedimento: ''
      })
    }
  }

  public acceptDevolucion(): void {

    if (this.lotes.length == 0) {
      this.presentToast('Falta agregar lote', 'warning')
    } else {
      if (this.productData.count != 0 && this.cantidad == 0) {
        this.productData.count = this.cantidad
        console.log(this.productData.count)
        this.navExtras.setScannedProducts(this.productData)
        this.router.navigate(['/members/purchase-return-detail'])
      } else if (this.cantidad <= 0) {
        this.presentToast('Debe igresar una cantidad valida', 'warning')
        return
      } else if (this.productData.Detail.QryGroup41 == 'Y') {
        this.productData.count = this.cantidad
        console.log(this.productData.count)
        this.productData.detalle = this.lotes
        this.navExtras.setScannedProducts(this.productData)
        this.router.navigate(['/members/purchase-return-detail'])
      } else {
        this.productData.count = this.lotes.map(lote => lote.quantity).reduce((a, b) => a + b, 0)
        console.log(this.productData.count)
        this.productData.detalle = this.lotes
        this.navExtras.setScannedProducts(this.productData)
        this.router.navigate(['/members/purchase-return-detail'])
      }
    }

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
