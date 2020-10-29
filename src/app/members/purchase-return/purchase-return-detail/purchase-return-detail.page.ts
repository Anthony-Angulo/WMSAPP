import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../services/settings.service';
import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { ToastController, LoadingController } from '@ionic/angular';
import { getSettingsFileData } from '../../commons';

const TOKEN_KEY = 'auth-token';


//TODO: Refactor CODE from this component BEEF CodeBarInputChange

@Component({
  selector: 'app-purchase-return-detail',
  templateUrl: './purchase-return-detail.page.html',
  styleUrls: ['./purchase-return-detail.page.scss'],
})
export class PurchaseReturnDetailPage implements OnInit {

  public appSettings: any;

  data: any;
  apiSAP: any;
  Entry: any;
  products: any = [];
  load: any;

  constructor(
    private http: HttpClient,
    private settings: SettingsService,
    private navExtras: NavExtrasService,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,
    private platform: Platform,
    private storage: Storage
  ) { }

  async ngOnInit() {

    await this.presentLoading("Buscando Detalle..");

    this.appSettings = getSettingsFileData(this.platform, this.settings);


    let productsReturn = this.navExtras.getEntry();

    let token = await this.storage.get(TOKEN_KEY);

    let headers = new HttpHeaders();

    headers = headers.set('Authorization', `Bearer ${token}`);

    this.http.get(`${this.appSettings.apiSAP}/api/purchasedelivery/return/${productsReturn.DocEntry}`, { headers }).toPromise().then((res) => {
      this.Entry = res
      console.log(res)
    }).catch((error) => {
      if (error.status == 404) {
        this.presentToast('No encontrado o no existe', 'warning')
        this.router.navigate(['/members/purchase-return'])
      } else if (error.status == 400) {
        this.presentToast(error.error, 'warning')
        this.router.navigate(['/members/purchase-return'])
      } else {
        this.presentToast('Error de conexion', 'danger')
        this.router.navigate(['/members/purchase-return'])
      }
    }).finally(() => { this.hideLoading() })
  }

  ionViewWillEnter() {

    let productsScanned = this.navExtras.getScannedProducts()

    if (productsScanned != null) {
      if (productsScanned.count <= 0) {
        let ind = this.products.findIndex(product => product.ItemCode == productsScanned.ItemCode)
        this.products.splice(ind, 1)
      } else {
        let index = this.Entry.PDN1.findIndex(product => product.ItemCode == productsScanned.ItemCode)
        this.Entry.PDN1[index].count = productsScanned.count
        this.products.push(productsScanned)
      }
    }

    this.navExtras.setScannedProducts(null)

  }

  goToProduct(index: number) {
    this.navExtras.setProducts(this.Entry.PDN1[index])

    if (this.Entry.PDN1[index].Detail.U_IL_TipPes == 'V') {
      this.router.navigate(['members/purchase-return-beef'])
    } else if (this.Entry.PDN1[index].Detail.ManBtchNum == 'Y') {
      this.router.navigate(['members/purchase-return-abarrotes-batch'])
    } else {
      this.router.navigate(['/members/purchase-return-abarrotes'])
    }
  }

  public async sendProducts() {

    await this.presentLoading("Devolviendo Mercancia...");

    let productsReturn = this.navExtras.getEntry();

    let token = await this.storage.get(TOKEN_KEY);

    let headers = new HttpHeaders();

    headers = headers.set('Authorization', `Bearer ${token}`);

    const products = this.Entry.PDN1.filter(product => product.count)
      .map(product => {
        return {
          ItemCode: product.ItemCode,
          UoMEntry: product.UomEntry,
          WarehouseCode: product.WhsCode,
          Line: product.LineNum,
          Count: product.count,
          ItemType: product.Detail.U_IL_TipPes,
          Group: (product.Detail.QryGroup43 == "Y") ? 43 : 0,
          Batch: (product.detalle) ? product.detalle : []
        }
      })

    if (products.length != 0) {
      const purchaseReturnData = {
        order: this.Entry.DocEntry,
        products
      }

      this.http.post(`${this.appSettings.apiSAP}/api/PurchaseOrderDeliveryReturn`, purchaseReturnData, { headers }).toPromise().then((resp) => {
        this.presentToast("Devolucion Completa", "success")
        this.router.navigate(['/members/purchase-return'])
        this.Entry = undefined
      }).catch(error => {
        if(error.status == 401) {
          this.presentToast(error.error, "danger");
        } else {
          this.presentToast(error.error, 'danger')
        }
      }).finally(() => {
        this.hideLoading()
      })
    } else {
      this.presentToast('No hay productos que recibir.', 'warning')
      this.hideLoading()
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

  async presentLoading(msg) {
    this.load = await this.loading.create({
      message: msg,
    });

    await this.load.present()
  }

  hideLoading() {
    this.load.dismiss()
  }

}
