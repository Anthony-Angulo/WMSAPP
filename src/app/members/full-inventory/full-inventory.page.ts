import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SettingsService } from '../../services/settings.service';
import { NavExtrasService } from '../../services/nav-extras.service';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { getSettingsFileData } from '../commons';
import { Platform, ToastController, LoadingController, AlertController } from '@ionic/angular';

const TOKEN_KEY = 'auth_token';

@Component({
  selector: 'app-full-inventory',
  templateUrl: './full-inventory.page.html',
  styleUrls: ['./full-inventory.page.scss'],
})
export class FullInventoryPage implements OnInit {

  public appSettings: any;

  load: any;
  inventory_orders: any;
  orders: boolean = true
  productCode: string
  Filedata: any;
  warehouseCode: any;
  apiSAPURL: any;
  productDetail: any;
  headerId: number;
  employeeName: any;
  search: string;
  searchType: any;
  location: any;



  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private platform: Platform,
    private settings: SettingsService,
    private alertController: AlertController,
    private navExtras: NavExtrasService,
    private loading: LoadingController,
    private storage: Storage
  ) { }

  async ngOnInit() {

    await this.presentLoading('Buscando..');

    this.http.get(`${environment.apiWMS}/fullInventoryRequestList`).toPromise().then((inventory_orders: any) => {
      this.inventory_orders = inventory_orders
    }).catch(() => {
      this.presentToast('Error al obtener ordenes.', 'danger')
    }).finally(() => {
      this.hideLoading()
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

  goToInventory(index: number) {
    this.headerId = this.inventory_orders[index].id
    this.orders = false
    this.promptLocation()
  }

  async getProductByCode() {

    await this.presentLoading('Buscando Producto...');

    let token = await this.storage.get(TOKEN_KEY);

    let headers = new HttpHeaders();

    headers = headers.set('Authorization', `Bearer ${token}`)

    Promise.all([
      this.http.get(`${this.appSettings.apiSAP}/api/Products/Detail/${this.productCode.toUpperCase()}`, {headers}).toPromise(),
      this.http.get(`${environment.apiWMS}/checkProduct/${this.productCode.toUpperCase()}/${this.headerId}`).toPromise(),
      this.http.get(`${environment.apiWMS}/codebardescriptionsVariants/${this.productCode.toUpperCase()}`).toPromise()
    ]).then(([productDetail, prodStatus, cBDetail]: any) => {

      if(productDetail.Detail.ItemName == null) {
        this.presentToast("No se Encontre Un Producto Con Ese Codigo","warning");
        return
      } else if(prodStatus.Status == 1) {
        this.presentToast("Este Producto Ya Fue Cerrado","warning");
        return
      }

        this.productDetail = productDetail;
        this.productDetail.headerId = this.headerId;
        this.productDetail.location = this.location;
        this.navExtras.setInventoryProduct(this.productDetail);

        if(this.productDetail.Detail.U_IL_TipPes == "F") {
          this.router.navigate(['/members/full-abarrotes']);
        }
        
        if(cBDetail.length != 0) {
          this.productDetail.cBDetail = cBDetail;
        } else {
          this.productDetail.cBDetaiil = [];
        }

        this.router.navigate(['/members/full-beef']);
    }).catch(async err => {
      if(err.status == 401) {
        this.presentToast(err.error,"danger");
      } else {
        this.presentToast(err.error,"danger");
      }
    }).finally(() => {
      this.hideLoading();
    })
  }

  async searchProductByCb() {


    if(this.search == '') return

    await this.presentLoading('Buscando Producto...');

    let token = await this.storage.get(TOKEN_KEY);

    let headers = new HttpHeaders();

    headers = headers.set('Authorization', `Bearer ${token}`)

    this.productDetail = await this.http.get(`${this.appSettings.apiSAP}/api/CodeBar/${this.search}`, { headers }).toPromise();

    if (this.productDetail.Detail.ItemName == null) {
      this.presentToast("No se Encontro Un Producto Con Ese Codigo", "warning");
      return
    }

    Promise.all([
      this.http.get(`${environment.apiWMS}/checkProduct/${this.productDetail.Detail.ItemCode}/${this.headerId}`).toPromise(),
      this.http.get(`${environment.apiWMS}/codebardescriptionsVariants/${this.productDetail.Detail.ItemCode}`).toPromise()
    ]).then(([prodStatus, cBDetail]: any) => {

      if (prodStatus.Status == 1) {
        this.presentToast("Este Producto Ya Fue Cerrado", "warning");
        return
      }

      this.productDetail.headerId = this.headerId;
      this.productDetail.location = this.location;
      this.navExtras.setInventoryProduct(this.productDetail);

      if (this.productDetail.Detail.U_IL_TipPes == "F") {
        this.router.navigate(['/members/full-abarrotes']);
      }

      if (cBDetail.length != 0) {
        this.productDetail.cBDetail = cBDetail;
      } else {
        this.productDetail.cBDetaiil = [];
      }

      this.router.navigate(['/members/full-beef']);
      
    }).catch((err) => {
      this.presentToast(err.error, "danger");
    }).finally(() => {
      this.hideLoading();
    })

    this.search = '';
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
