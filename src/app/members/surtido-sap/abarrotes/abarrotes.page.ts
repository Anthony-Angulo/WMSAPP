import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { SettingsService } from '../../../services/settings.service';
import { HttpClient } from '@angular/common/http';
import { Platform } from '@ionic/angular';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { getSettingsFileData } from '../../commons';

@Component({
  selector: 'app-abarrotes',
  templateUrl: './abarrotes.page.html',
  styleUrls: ['./abarrotes.page.scss'],
})
export class AbarrotesPage implements OnInit {

  public productData: any
  public appSettings: any;
  public uom: any;
  public cantidad: number;
  public stock: any;
  public DeliveryRowDetailList: any = [];
  public totalConvertido: number;
  public totalInUnitBase: number;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private platform: Platform,
    private settings: SettingsService,
    private receptionService: RecepcionDataService) { }

  ngOnInit() {

    this.productData = this.receptionService.getOrderData();

    this.appSettings = getSettingsFileData(this.platform, this.settings);

    if(this.productData.DeliveryRowDetailList) {
      this.DeliveryRowDetailList = this.productData.DeliveryRowDetailList;
    }


    this.http.get(`${this.appSettings.apiSAP}/api/batch/${this.productData.WhsCode}/${this.productData.ItemCode}`).toPromise().then((val: any) => {
      this.stock = val.stock;
    }).catch((error) => {
      console.log(error)
      this.presentToast('Error al traer stock de producto', 'danger')
    })
  }

  public calculateTotal() {

    if(this.cantidad == undefined || this.cantidad == 0) return

    this.totalConvertido = Number(this.uom.BaseQty * this.cantidad)

    let findProd = this.DeliveryRowDetailList.findIndex(prod => prod.uom == this.uom.UomCode)

    if(findProd < 0) {
      this.DeliveryRowDetailList.push({
        Count: this.cantidad,
        Cajas: Number(this.cantidad),
        UomEntry: this.uom.UomEntry,
        ItemCode: this.productData.ItemCode,
        total: this.totalConvertido,
        uom: this.uom.UomCode,
        BatchList: []
      })
    } else {
      this.DeliveryRowDetailList[findProd].Count = this.cantidad
      this.DeliveryRowDetailList[findProd].Cajas = Number(this.cantidad)
      this.DeliveryRowDetailList[findProd].ItemCode = this.productData.ItemCode
      this.DeliveryRowDetailList[findProd].total = this.totalConvertido
    }

    this.totalInUnitBase = this.DeliveryRowDetailList.map(prod => prod.total).reduce((a,b) => a + b, 0);
    
  }

  public eliminarProducto(index: number) {
    this.DeliveryRowDetailList.splice(index, 1);
    this.totalInUnitBase = this.DeliveryRowDetailList.map(prod => prod.total).reduce((a,b) => a + b, 0);
  }

  acceptRecepton() {

    if (!this.DeliveryRowDetailList) {
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/surtido-sap'])
      return
    }

    let validPercent = (Number(this.appSettings.porcentaje) / 100) * Number(this.productData.OpenInvQty)
    let validQuantity = Number(validPercent) + Number(this.productData.OpenInvQty)

    if (Number(this.totalInUnitBase) > Number(validQuantity)) {
      this.presentToast('Cantidad ingresada excede de la cantidad solicitada', 'warning')
      return
    }


    this.productData.DeliveryRowDetailList = this.DeliveryRowDetailList

    console.log(this.productData)
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
