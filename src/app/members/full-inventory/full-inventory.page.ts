import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SettingsService } from '../../services/settings.service';
import { NavExtrasService } from '../../services/nav-extras.service';
import { Router } from '@angular/router';
import { Platform, ToastController, LoadingController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-full-inventory',
  templateUrl: './full-inventory.page.html',
  styleUrls: ['./full-inventory.page.scss'],
})
export class FullInventoryPage implements OnInit {

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
    private loading: LoadingController
  ) { }

  async ngOnInit() {

    await this.presentLoading('Buscando..')

    this.http.get(`${environment.apiWMS}/fullInventoryRequestList`).toPromise().then((inventory_orders: any) => {
      this.inventory_orders = inventory_orders
    }).catch(() => {
      this.presentToast('Error al obtener ordenes.', 'danger')
    }).finally(() => {
      this.hideLoading()
    });

    if (this.platform.is("cordova")) {
      this.Filedata = this.settings.fileData
      this.warehouseCode = this.Filedata.sucursal
      this.apiSAPURL = this.Filedata.apiSAP
    } else {
      this.apiSAPURL = environment.apiSAP
      this.warehouseCode = "S01"
    }
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

    await this.presentLoading('Buscando...')

    this.http.get(this.apiSAPURL + '/api/products/detail/' + this.productCode
      .toUpperCase()).toPromise().then((prod: any) => {
        if (prod) {
          this.productDetail = prod
          this.http.get(environment.apiWMS + '/checkProduct/' +
            this.productDetail.Detail.ItemCode + '/' + this.headerId)
            .toPromise().then((datos: any) => {
              if (datos.Status == 1) {
                this.presentToast('Este producto ya fue cerrado', 'warning')
              } else {
                this.productDetail.headerId = this.headerId
                this.productDetail.location = this.location
                this.navExtras.setInventoryProduct(this.productDetail)
                if (this.productDetail.Detail.U_IL_TipPes == "F") {
                  this.router.navigate(['/members/full-abarrotes'])
                } else {
                  this.http.get(environment.apiWMS +
                    '/codebardescriptionsVariants/' +
                    this.productDetail.Detail.ItemCode).toPromise()
                    .then((codeBars: any) => {
                      if (codeBars.length != 0) {
                        this.productDetail.cBDetail = codeBars
                      } else {
                        this.productDetail.cBDetail = []
                      }
                      this.router.navigate(['/members/full-beef'])
                    })
                }
              }
            })
        }
        console.log(this.productDetail)
      }).catch((error) => {
        console.log(error)
        this.presentToast('Error al buscar producto', 'danger')
      }).finally(() => {
        this.hideLoading()
      })
  }

  async searchProductByCb() {
    await this.presentLoading('Buscando....')

    if (this.search == '') {

    } else {
      this.http.get(this.apiSAPURL + '/api/codebar/' + this.search).toPromise()
        .then((prod: any) => {
          if (prod) {
            this.productDetail = prod
            this.http.get(environment.apiWMS + '/checkProduct/'
              + this.productDetail.Detail.ItemCode + '/' + this.headerId)
              .toPromise().then((datos: any) => {
                if (datos.Status == 1) {
                  this.presentToast('Este producto ya fue cerrado', 'warning')
                } else {
                  this.productDetail.headerId = this.headerId
                  this.productDetail.location = this.location
                  this.navExtras.setInventoryProduct(this.productDetail)
                  if (this.productDetail.Detail.U_IL_TipPes == "F") {
                    this.router.navigate(['/members/full-abarrotes'])
                  } else {
                    this.http.get(environment.apiWMS + '/codebardescriptionsVariants/'
                      + this.productDetail.Detail.ItemCode)
                      .toPromise().then((codeBars: any) => {
                        if (codeBars.length != 0) {
                          this.productDetail.cbDetail = codeBars
                        } else {
                          this.productDetail.cbDetail = []
                        }
                        this.router.navigate(['/members/full-beef'])
                      })
                  }
                }
              })
          }
          console.log(this.productDetail)
        }).catch((error) => {
          this.presentToast('Error al buscar producto', 'danger')
          console.log(error)
        }).finally(() => {
          this.hideLoading()
        })
    }

    this.search = ''
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
