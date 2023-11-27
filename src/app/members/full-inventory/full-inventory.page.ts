import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SettingsService } from '../../services/settings.service';
import { NavExtrasService } from '../../services/nav-extras.service';
import { Router } from '@angular/router';
import { getSettingsFileData } from '../commons';
import { Platform, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { InventoryOrders } from '../../interfaces/fullInventory';
import { Settings } from '../../interfaces/settings';

declare var parseBarcode: any;

@Component({
  selector: 'app-full-inventory',
  templateUrl: './full-inventory.page.html',
  styleUrls: ['./full-inventory.page.scss'],
})
export class FullInventoryPage implements OnInit {

  inventory_orders: InventoryOrders;
  appSettings: Settings;

  load: any;
  orders: boolean = true;
  productCode: string;
  productCodeScanned: string;
  productDetail: any;
  headerId: number;
  search: string;
  searchType: boolean;
  whsType:any;
  location: string;
  answer:any;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private platform: Platform,
    private settings: SettingsService,
    private alertController: AlertController,
    private navExtras: NavExtrasService,
    private loading: LoadingController,
  ) { }

  async ngOnInit() {

    await this.presentLoading('Buscando..');


    this.http.get(`${environment.apiCCFN}/inventory/fullInventory`)
      .toPromise().then((inventory_orders: InventoryOrders) => {
        this.inventory_orders = inventory_orders;
      }).catch(() => {
        this.presentToast('Error al obtener ordenes.', 'danger');
      }).finally(() => {
        this.hideLoading();
      });

    this.appSettings = getSettingsFileData(this.platform, this.settings);

  }

  async promptLocation() {
    const alert = await this.alertController.create({
      header: 'Ubicacion',
      message: 'Ingresa ubicacion inicial',
      inputs: [
        {
          name: 'Ubicacion',
          type: 'text',
        },
      ],
      buttons: [
        {
          text: 'Aceptar',
          handler: (data) => {
            if (data.Ubicacion == '') {
              this.presentToast('Debes ingresar una ubicacion', 'warning')
              this.promptLocation()
            } else {
              this.location = data.Ubicacion
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async searchCode() {

    const alert = await this.alertController.create({
      header: 'CodigoSAP',
      message: 'Ingresa Codigo SAP',
      inputs: [
        {
          name: 'CodigoSAP',
          type: 'text',
        },
      ],
      buttons: [
        {
          text: 'Aceptar',
          handler: (data) => {
            if (data.CodigoSAP == '') {
              this.presentToast('Debes ingresar un codigo', 'warning')
              this.searchCode()
            } else {
              this.productCode = data.CodigoSAP;
              this.getProductByCode();
            }
          }
        }
      ]
    });

    await alert.present();

  }

  goToInventory(index: number) {
    this.headerId = this.inventory_orders[index].ID
    // this.whsType = this.inventory_orders[index].WhsType
    this.orders = false
    this.promptLocation()
  }

  async getProductByCode() {

    // if(this.whsType == 1) {
    //   this.getProductRetail();
    //   return
    // }

    await this.presentLoading('Buscando Producto...');


    Promise.all([
      this.http.get(`${environment.apiSAP}/api/Products/Detail/${this.productCode.toUpperCase()}`).toPromise(),
      this.http.get(`${environment.apiCCFN}/codeBar/${this.productCode.toUpperCase()}`).toPromise()
    ]).then(([productDetail, cBDetail]: any) => {

      if (productDetail.Detail.ItemName == null) {
        this.presentToast("No se Encontre Un Producto Con Ese Codigo", "warning");
        return
      }

      this.productDetail = productDetail;
      this.productDetail.Detail.busqueda = 1;
      this.productDetail.headerId = this.headerId;
      this.productDetail.location = this.location;

      if (cBDetail.length != 0) {
        this.productDetail.cBDetail = cBDetail;
      } else {
        this.productDetail.cBDetaiil = [];
      }

      this.navExtras.setInventoryProduct(this.productDetail);



      if (this.productDetail.Detail.U_IL_TipPes == "F") {
        this.router.navigate(['/members/full-abarrotes']);
        return
      }

      this.router.navigate(['/members/full-beef']);

    }).catch(async err => {
      console.log(err)
        this.presentToast(err.error, "danger");
    }).finally(() => {
      this.hideLoading();
    });


  }

  async searchProductByCb() {


    if (this.productCodeScanned == '') return

    await this.presentLoading('Buscando Producto...');


    this.productDetail = await this.http.get(`${environment.apiSAP}/api/CodeBar/${this.productCodeScanned}`).toPromise();


    // this.productDetail = await this.http.get(`${environment.apiSAP}/api/CodeBar/${this.search}`).toPromise();

    if (this.productDetail.Detail.ItemName == null) {
      this.presentToast("No se Encontro Un Producto Con Ese Codigo", "warning");
      this.productCodeScanned = '';
      return
    }

    Promise.all([
      this.http.get(`${environment.apiSAP}/api/Products/Detail/${this.productDetail.Detail.ItemCode}`).toPromise(),
      this.http.get(`${environment.apiCCFN}/codeBar/${this.productDetail.Detail.ItemCode}`).toPromise()
    ]).then(([productDetail, cBDetail]: any) => {

      if (productDetail.Detail.ItemName == null) {
        this.presentToast("No se Encontre Un Producto Con Ese Codigo", "warning");
        this.productCodeScanned = '';
        return
      }

      this.productDetail = productDetail;
      this.productDetail.Detail.busqueda = 0;
      this.productDetail.codeBar = this.productCodeScanned;
      this.productDetail.headerId = this.headerId;
      this.productDetail.location = this.location;

      if (cBDetail.length != 0) {
        this.productDetail.cBDetail = cBDetail;
      } else {
        this.productDetail.cBDetaiil = [];
      }

      this.navExtras.setInventoryProduct(this.productDetail);

      if (this.productDetail.Detail.U_IL_TipPes == "F") {
        this.router.navigate(['/members/full-abarrotes']);
        this.productCodeScanned = '';
        return
      }

      this.router.navigate(['/members/full-beef']);
      this.productCodeScanned = '';

    }).catch((err) => {
      this.presentToast(err.error, "danger");
    }).finally(() => {
      this.hideLoading();
    })

    this.productCodeScanned = '';
  }

  async searchProductByCbVariado() {
    if (this.search == '') return

    try {

      let answer = parseBarcode(this.search);

      await this.presentLoading('Buscando Producto...');

      this.productDetail = await this.http.get(`${environment.apiSAP}/api/Products/GetbyGTIN/${answer.parsedCodeItems[0].data}`).toPromise();


      // this.productDetail = await this.http.get(`${environment.apiSAP}/api/CodeBar/${this.search}`).toPromise();
  
      if (this.productDetail.Detail.ItemName == null) {
        this.presentToast("No se Encontro Un Producto Con Ese Codigo", "warning");
        this.productCodeScanned = '';
        return
      }
  
      Promise.all([
        this.http.get(`${environment.apiSAP}/api/Products/Detail/${this.productDetail.Detail.ItemCode}`).toPromise(),
        this.http.get(`${environment.apiCCFN}/codeBar/${this.productDetail.Detail.ItemCode}`).toPromise()
      ]).then(([productDetail, cBDetail]: any) => {
  
        if (productDetail.Detail.ItemName == null) {
          this.presentToast("No se Encontre Un Producto Con Ese Codigo", "warning");
          this.productCodeScanned = '';
          return
        }
  
        this.productDetail = productDetail;
        this.productDetail.Detail.busqueda = 0;
        this.productDetail.codeBar = this.productCodeScanned;
        this.productDetail.headerId = this.headerId;
        this.productDetail.location = this.location;
  
        if (cBDetail.length != 0) {
          this.productDetail.cBDetail = cBDetail;
        } else {
          this.productDetail.cBDetaiil = [];
        }
  
        this.navExtras.setInventoryProduct(this.productDetail);
  
        if (this.productDetail.Detail.U_IL_TipPes == "F") {
          this.router.navigate(['/members/full-abarrotes']);
          this.productCodeScanned = '';
          return
        }
  
        this.router.navigate(['/members/full-beef']);
        this.productCodeScanned = '';
  
      }).catch((err) => {
        this.presentToast(err.error, "danger");
      }).finally(() => {
        this.hideLoading();
      })
  
      this.search = '';

    }catch(err) {
      console.log(err)
    }
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
