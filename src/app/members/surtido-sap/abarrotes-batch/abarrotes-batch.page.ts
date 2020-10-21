import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SettingsService } from '../../../services/settings.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-abarrotes-batch',
  templateUrl: './abarrotes-batch.page.html',
  styleUrls: ['./abarrotes-batch.page.scss'],
})
export class AbarrotesBatchPage implements OnInit {

  productData: any
  cantidad: number;
  lotes = []
  lote: any
  fechaCad: Date = new Date()
  batch: any
  loteselect
  data
  porcentaje: any;
  apiSap: string;
  public uom: any;
  public productsToDeliver: any = [];
  public totalUnitBase: any;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private platform: Platform,
    private settings: SettingsService,
    private receptionService: RecepcionDataService
  ) { }

  ngOnInit() {
    this.productData = this.receptionService.getOrderData()

    if(this.productData.DeliveryRowDetailList) {
      this.productsToDeliver = this.productData.DeliveryRowDetailList;
    }

    if (this.platform.is("cordova")) {
      this.data = this.settings.fileData
      this.porcentaje = this.data.porcentaje
      this.apiSap = this.data.apiSAP;
    } else {
      this.porcentaje = "10"
      this.apiSap = environment.apiSAP
    }

    this.http.get(this.apiSap + '/api/batch/' + this.productData.WhsCode + '/' + this.productData.ItemCode).toPromise().then((data) => {
      console.log(data)
      this.batch = data
    }).catch(() => {
      this.presentToast('Error al traer lotes de producto', 'danger')
    })


  }

  public addLote() {

    if (this.cantidad == undefined || this.cantidad == 0) return

    if (this.lote == undefined || this.lote == '') {
      this.presentToast('Datos faltantes', 'warning')
      return
    }

    let dif = Math.abs(Number(Number(this.cantidad * this.uom.BaseQty).toFixedNoRounding(4)) - Number(this.productData.OpenInvQty))

    if (dif < 2) {

      let BatchList =[{
        Quantity: Number(this.productData.OpenInvQty),
        Code: this.lote,
      }]

      this.productsToDeliver.push({
        BatchList,
        Count: Number(this.cantidad),
        uom: this.uom.UomCode,
        UomEntry: this.uom.UomEntry,
        total: Number(Number(this.cantidad * this.uom.BaseQty).toFixedNoRounding(4)),
        lote: this.lote
      })
    } else {

      let BatchList = [{
        Quantity:  Number(Number(this.cantidad * this.uom.BaseQty).toFixedNoRounding(4)),
        Code: this.lote,
      }]

      this.productsToDeliver.push({
        BatchList,
        Count: Number(this.cantidad),
        total: Number(Number(this.cantidad * this.uom.BaseQty).toFixedNoRounding(4)),
        uom: this.uom.UomCode,
        UomEntry: this.uom.UomEntry,
        lote: this.lote
      })

    }

    this.totalUnitBase = this.productsToDeliver.map(prod => prod.total).reduce((a,b) => a + b, 0);

  }

  public eliminarProducto(index: number) {
    this.productsToDeliver.splice(index, 1);
    this.totalUnitBase = this.productsToDeliver.map(prod => prod.total).reduce((a,b) => a + b, 0);
  }

  acceptRecepton() {

    if (!this.productsToDeliver.length) {
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/surtido-sap'])
      return
    }

    this.productData.DeliveryRowDetailList = this.productsToDeliver
    this.receptionService.setReceptionData(this.productData)
    this.router.navigate(['/members/surtido-sap'])
    
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
