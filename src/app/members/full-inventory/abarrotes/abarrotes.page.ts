import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SettingsService } from '../../../services/settings.service';
import { NavExtrasService } from '../../../services/nav-extras.service';
import { getSettingsFileData } from '../../commons';
import {
  Platform,
  ToastController,
  LoadingController,
  AlertController
}
  from '@ionic/angular';

const USER = 'user';

@Component({
  selector: 'app-abarrotes',
  templateUrl: './abarrotes.page.html',
  styleUrls: ['./abarrotes.page.scss'],
})
export class AbarrotesPage implements OnInit {

  public productInfo: any;
  public appSettings: any;
  public warehouseCode: string;
  public apiSAPURL: string;
  public uom: any;
  public total: number;
  public cantidad: number;
  public location: string;
  public load: any;
  public rows = [];
  public lote: string;

  constructor(private navExtras: NavExtrasService,
    private http: HttpClient,
    private router: Router,
    private platform: Platform,
    private loading: LoadingController,
    private alertController: AlertController,
    private settings: SettingsService,
    private toastController: ToastController,
    private storage: Storage) { }

  ngOnInit() {

    this.productInfo = this.navExtras.getInventoryProduct();
    
    if(this.productInfo.Detail.busqueda == 0){
      console.log(this.productInfo)
      let index = this.productInfo.CodeBars.findIndex(x => x.BcdCode == this.productInfo.codeBar);
      console.log(index)
      // if(index < 0) {
      //   this.presentToast("Unidad de medida no esta ligada a codigo de barra/GTIN", "warning");
      // }
      this.uom = this.productInfo.uom.find(x => this.productInfo.CodeBars[index].UomEntry == x.UomEntry);
      console.log(this.uom)
    }

    console.log(this.productInfo)
    this.appSettings = getSettingsFileData(this.platform, this.settings);

  }


  public calculateTotal(): void {
    this.total = Number(this.uom.BaseQty * this.cantidad)
  }

  productDetail() {
    this.router.navigate(['/members/inventory-product-detail']);
  }



  async saveProduct() {

    if (this.total == undefined) {
      this.presentToast("Debes ingresar una cantidad", "warning")
      return
    }

    let codeBars = []
    let datos = []

    let user = await this.storage.get(USER);


    this.presentLoading('Guardando...');

    return this.http.get(`${environment.apiCCFN}/inventoryProduct/${this.productInfo.headerId}/${this.productInfo.Detail.ItemCode}`).toPromise().then((res: any) => {

      if (res.length > 0) {
        let update = {
          id: res[0].ID,
          itemcode: this.productInfo.Detail.ItemCode,
          quantity: this.total + res[0].Quantity
        }

        this.productInfo.productId = res[0].ID

        return this.http.put(`${environment.apiCCFN}/inventoryProduct`, update).toPromise()
      } else {

         datos.push([this.productInfo.Detail.ItemCode,
          this.productInfo.Detail.ItemName,
          this.total,
          0,
          this.productInfo.Detail.ManBtchNum,
          this.productInfo.Detail.U_IL_TipPes,
          user.id,
          this.productInfo.headerId])

        return this.http.post(`${environment.apiCCFN}/inventoryProduct`, datos).toPromise()
      }
    }).then((res: any) => {

      let detail = {
        quantity: this.total,
        zone: this.productInfo.location,
        userId: user.id,
        codeBar: (this.productInfo.codeBar == undefined) ? 'Codigo Manual': this.productInfo.codeBar,
        uomCode: this.uom.UomCode,
        inventoryProductId: (res.insertId == 0) ? this.productInfo.productId : res.insertId
      }

      return this.http.post(`${environment.apiCCFN}/inventoryDetail`, detail).toPromise()

    }).then((res: any) => {

      if(this.productInfo.Detail.ManBtchNum == 'Y') {
        codeBars.push([
          this.total,
          this.lote,
          'Sin Codigo de Barra',
          res.id
        ])
      }

      console.log(codeBars)

      return this.http.post(`${environment.apiCCFN}/inventoryCodeBar`, codeBars).toPromise()
    }).then((res: any) => {
      if(res) {
        this.presentToast('Guardado Correctamente', 'success')
        this.cantidad = 0
        this.router.navigate(['/members/full-inventory'])
      }
    }).catch((err: any) => {
      console.log(err)
      this.presentToast(err.message, "danger")
    }).finally(() => this.hideLoading());

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

  async presentLoading(msg: string) {
    this.load = await this.loading.create({
      message: msg,
      duration: 3000
    });

    await this.load.present()
  }

  hideLoading() {
    this.load.dismiss()
  }

}
