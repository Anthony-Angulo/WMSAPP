import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { SettingsService } from './../../services/settings.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { getSettingsFileData } from '../commons';

const TOKEN_KEY = 'auth-token';

@Component({
  selector: 'app-surtido-sap',
  templateUrl: './surtido-sap.page.html',
  styleUrls: ['./surtido-sap.page.scss'],
})
export class SurtidoSapPage implements OnInit {

  public appSettings: any;

  public load: any;
  public order: any;
  public number: number;
  public searchType: any;
  public products: any = []
  public crBars: any = [];
  public search: string;

  constructor(
    private http: HttpClient,
    private receptionService: RecepcionDataService,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,
    private platform: Platform,
    private settings: SettingsService,
    private storage: Storage
  ) { }

  ngOnInit() {

    this.appSettings = getSettingsFileData(this.platform, this.settings);
  }

  ionViewWillEnter() {

    let productsScanned = this.receptionService.getReceptionData()


    if (productsScanned == null) {
      return
    }


    if (productsScanned.DeliveryRowDetailList) {
      let index = this.order.Lines.findIndex(product => product.ItemCode == productsScanned.ItemCode)
      this.order.Lines[index].count = productsScanned.DeliveryRowDetailList.map(prod => prod.Count).reduce((a, b) => a + b, 0)
      let isScanned = this.products.findIndex(prd => prd.ItemCode == productsScanned.ItemCode)
      if (isScanned < 0) {
        this.products.push(productsScanned)
      }
      this.crBars = this.order.Lines[index].crBarsUpdate;
    } else {
      let ind = this.products.findIndex(product => product.ItemCode == productsScanned.ItemCode)
      if (ind >= 0) {
        this.products.splice(ind, 1)
      }
    }

    console.log(this.products)

    this.receptionService.setReceptionData(null)
  }

  async getOrden() {
    await this.presentLoading('Buscando....');

  
      this.http.get(`${this.appSettings.apiSAP}/api/order/DeliverySAPNew/${this.number}`).toPromise().then((data: any) => {
        this.order = data;
      }).catch(error => {
        if (error.status == 404) {
          this.presentToast('No encontrado o no existe', 'warning')
        } else if (error.status == 400) {
          this.presentToast(error.statusText, 'warning')
        } else if (error.status == 204) {
          this.presentToast('Error de conexion', 'danger')
        }
      }).finally(() => {
        this.hideLoading()
      })

    
  }

  public searchProductByCode() {

    let index = this.order.Lines.findIndex(x => x.ItemCode == this.search.toUpperCase());

    if (index < 0) {
      this.presentToast("Producto no se encontro en la lista", "warning");
      return
    }

    if (this.order.Lines[index].LineStatus == 'C') {
      this.presentToast("Este producto ya se surtio completamente", "warning");
      return
    }

    this.receptionService.setOrderData(this.order.Lines[index]);

    if (this.order.Lines[index].Detail.ManBtchNum == 'Y') {
      this.router.navigate(['members/surtido-abarrotes-batch']);
    } else if (this.order.Lines[index].Detail.U_IL_TipPes == 'V') {
      this.router.navigate(['members/surtido-beef']);
    } else {
      this.router.navigate(['/members/surtido-abarrotes']);
    }

    this.search = '';

  }

  public searchProductByCb() {

    if (this.search == '') return

    let found;

    let index = this.order.Lines.findIndex(x => {
      found = x.CodeBars.findIndex(y => y == this.search)
      if (found > -1) {
        return true
      } else {
        return false
      }
    });

    if (index < 0) {
      this.presentToast("Producto no se encontro en la lista", "warning");
      return
    }

    if(this.order.Lines[index].CodeBars[found].UomEntry != this.order.Lines[index].UomEntry) {
      this.presentToastmid("La unidad de medida escaneada no es igual a la del pedido.", "warning");
    }

    if (this.order.Lines[index].LineStatus == 'C') {
      this.presentToast("Este producto ya se surtio completamente", "warning");
      return
    }

    this.receptionService.setOrderData(this.order.Lines[index]);

    if (this.order.Lines[index].Detail.ManBtchNum == 'Y') {
      this.router.navigate(['members/surtido-abarrotes-batch']);
    } else if (this.order.Lines[index].Detail.U_IL_TipPes == 'V') {
      this.router.navigate(['members/surtido-beef']);
    } else {
      this.router.navigate(['/members/surtido-abarrotes']);
    }

    document.getElementById('input-codigo').setAttribute('value', '');


  }


  public goToProduct(index) {

    this.receptionService.setOrderData(this.order.Lines[index])

    if (this.order.Lines[index].U_IL_TipPes == 'V') {
      this.router.navigate(['members/surtido-beef'])
    } else if (this.order.Lines[index].ManBtchNum == 'Y') {
      this.router.navigate(['members/surtido-abarrotes-batch'])
    } else {
      this.router.navigate(['/members/surtido-abarrotes'])
    }
  }

  async sendProducts() {

    await this.presentLoading('Enviando....');



    const DeliveryRowDetailList = this.products.map(product => {
      return {
        LineNum: product.LineNum,
        DeliveryRowDetailList: (product.DeliveryRowDetailList) ? product.DeliveryRowDetailList : []
      };
    });

    console.log(DeliveryRowDetailList)

    if (DeliveryRowDetailList.length != 0) {
      const recepcionData = {
        DocEntry: this.order.DocEntry,
        DeliveryRows: DeliveryRowDetailList
      };



      this.http.post(`${this.appSettings.apiSAP}/api/Delivery/SAP`, recepcionData).toPromise().then((data: any) => {
        console.log(data);
        this.sendUpdateCr();
        this.presentToast('Surtido Concluido', 'success');
        this.order = undefined;
        this.number = undefined;
        this.products = [];
      }).catch(error => {
        console.log(error)
        this.presentToast(error.error, 'danger')
      }).finally(() => {
        this.hideLoading()
      });
      
    } else {
      this.presentToast('No hay productos que surtir', 'warning')
      this.hideLoading()
    }


  }

  async sendUpdateCr() {
    await this.http.put(`${environment.apiCCFN}/crbar/updateCr`, this.crBars).toPromise()
  }



  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      color: color,
      duration: 4000
    });
    toast.present();
  }

  async presentToastmid(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      color: color,
      duration: 4000,
      position: 'middle'
    });
    toast.present();
  }

  async presentLoading(msg) {
    this.load = await this.loading.create({
      message: msg,
      // duration: 3000
    });

    await this.load.present()
  }

  hideLoading() {
    // console.log('loading')
    this.load.dismiss()
  }

}
