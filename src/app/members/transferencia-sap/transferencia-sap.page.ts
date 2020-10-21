import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { Platform } from '@ionic/angular';
import { SettingsService } from './../../services/settings.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { getSettingsFileData } from '../commons';

const TOKEN_KEY = 'auth-token';

@Component({
  selector: 'app-transferencia-sap',
  templateUrl: './transferencia-sap.page.html',
  styleUrls: ['./transferencia-sap.page.scss'],
})
export class TransferenciaSapPage implements OnInit {

  public load: any;
  public transferData: any;
  public search: any;
  public transferRequestDocNum: number;
  public searchType: any;
  public ctd: number;
  public products: any = []
  public tarima: string;
  public appSettings: any;

  constructor(
    private http: HttpClient,
    private receptionService: RecepcionDataService,
    private toastController: ToastController,
    private router: Router,
    private platform: Platform,
    private settings: SettingsService,
    private loading: LoadingController,
    private storage: Storage
  ) { }

  /* Al iniciar el componente traera la informacion de los ajustes de la aplicacion*/
  ngOnInit() {
    this.appSettings = getSettingsFileData(this.platform, this.settings);
  }

  ionViewWillEnter() {

    let productsScanned = this.receptionService.getReceptionData()

    if (productsScanned == null) return

    if (productsScanned.count <= 0) {
      let ind = this.products.findIndex(product => product.ItemCode == productsScanned.ItemCode)
      this.products.splice(ind, 1)
    } else {
      let index = this.transferData.Lines.findIndex(product => product.ItemCode == productsScanned.ItemCode)
      this.transferData.Lines[index].count = productsScanned.count
      this.products.push(productsScanned)
    }

    console.log(this.products)
    this.receptionService.setReceptionData(null)

  }


  /* Metodo para traer informacion sobre solicitud de transferencia y descripcion de codigos de barra de productos de tipo variado */
  async getOrden() {

    await this.presentLoading('Buscando Solicitud....')

    let token = await this.storage.get(TOKEN_KEY);

    let headers = new HttpHeaders();

    headers = headers.set('Authorization', `Bearer ${token}`)


    this.http.get(`${this.appSettings.apiSAP}/api/InventoryTransferRequest/DeliverySAP/${this.transferRequestDocNum}`, { headers }).toPromise().then((transferData: any) => {
      this.transferData = transferData;
      let validOrder = this.transferData.Lines.findIndex(x => x.FromWhsCod == this.transferData.Filler && x.WhsCode == this.transferData.ToWhsCode)
      if (validOrder >= 0) {
        this.presentToast('Orden de transferencia mal creada. Revisar almacenes de salida y destino.', 'warning')
        return
      } else {
        return this.transferData.Lines.filter((x: any) => x.U_IL_TipPes != 'F').map((x: any) => x.ItemCode);
      }
    }).then((itemCodes: Array<string>[]) => {
      if (itemCodes.length != 0) {
        return this.http.get(environment.apiWMS + '/codebardescriptionsVariants/' + itemCodes).toPromise()
      }
    }).then((codebarDescription: any[]) => {
      if (codebarDescription) {
        this.transferData.Lines.map((item: any) => {
          item.cBDetail = codebarDescription.filter(y => y.codigo_sap == item.ItemCode)
        })
      }
    }).catch(error => {
      console.log(error)
      if (error.status == 404) {
        this.presentToast('No encontrado o no existe', 'warning')
      } else if (error.status == 400) {
        this.presentToast(error.error, 'warning')
      } else if (error.status == 500) {
        this.presentToast('Error de conexion', 'danger')
      }
    }).finally(() => {
      this.hideLoading()
    })
  }

  public searchProductByCode() {

    let index = this.transferData.Lines.findIndex(x => x.ItemCode == this.search.toUpperCase())

    if (index < 0) {
      this.presentToast("Codigo De Producto No Encontrado En La Orden", "warning");
      return
    }

    if (this.transferData.Lines[index].LineStatus == 'C') {
      this.presentToast('Este Producto Ya Fue Transferido Completamente y Se Cerro En El Documento De Origen.', 'warning');
      return
    }

    this.receptionService.setOrderData(this.transferData.Lines[index])

    if (this.transferData.Lines[index].U_IL_TipPes == 'V') {
      this.router.navigate(['members/transferencia-beef'])
    } else if (this.transferData.Lines[index].ManBtchNum == 'Y') {
      this.router.navigate(['members/transferencia-abarrotes-batch'])
    } else {
      this.router.navigate(['/members/transferencia-abarrotes'])
    }


    this.search = '';
  }

  // searchProductByCb() {
  //   if (this.search == '') {

  //   } else {


  //     let index = this.transferData.Lines.findIndex(x => {
  //       let found = x.CodeBars.findIndex(y => y.BcdCode == this.search)
  //       if (found > -1) {
  //         return true
  //       } else {
  //         return false
  //       }
  //     })
  //     if (index >= 0) {
  //       if (Number(this.ctd) > Number(this.transferData.Lines[index].OpenQty)) {
  //         this.presentToast('Cantidad Excede el limite', 'warning')
  //       } else {
  //         if (this.transferData.Lines[index].LineStatus == 'O') {
  //           if (this.tarima == undefined || this.tarima == '') {
  //             this.presentToast('Ingresa tarima', 'warning')
  //           } else {
  //             if (this.transferData.Lines[index].Detail.ManBtchNum == 'Y') {
  //               this.receptionService.setOrderData(this.transferData.Lines[index])
  //               this.presentToast('Ingresa Lote de Producto', 'warning')
  //               if (this.transferData.Lines[index].Detail.U_IL_TipPes == 'V') {
  //                 this.router.navigate(['members/transferencia-beef'])
  //               } else if (this.transferData.Lines[index].Detail.ManBtchNum == 'Y') {
  //                 this.transferData.Lines[index].count = this.ctd
  //                 this.transferData.Lines[index].pallet = this.tarima
  //                 this.router.navigate(['members/transferencia-abarrotes-batch'])
  //               } else {
  //                 this.router.navigate(['/members/transferencia-abarrotes'])
  //               }
  //             } else {
  //               this.transferData.Lines[index].count = Number(this.ctd)
  //               this.transferData.Lines[index].pallet = this.tarima
  //               this.presentToast('Se agrego a la lista', 'success')
  //             }
  //           }

  //         } else {
  //           this.presentToast('Este producto ya se surtio completamente', 'warning')
  //         }
  //       }

  //     } else {
  //       this.presentToast('Producto no se encontro en la lista', 'warning')
  //     }
  //   }

  //   document.getElementById('input-codigo').setAttribute('value', '')

  // }


  /* Metodo para enviar al usuario a la pagina de producto a transferir */
  public goToProductPage(indexOfProduct: number) {

    this.receptionService.setOrderData(this.transferData.Lines[indexOfProduct])

    if (this.transferData.Lines[indexOfProduct].U_IL_TipPes == 'V') {
      this.router.navigate(['members/transferencia-beef'])
    } else if (this.transferData.Lines[indexOfProduct].ManBtchNum == 'Y') {
      this.router.navigate(['members/transferencia-abarrotes-batch'])
    } else {
      this.router.navigate(['/members/transferencia-abarrotes'])
    }
  }

  async sendProducts() {

    await this.presentLoading('Transfiriendo Productos....')

    const TransferRows = this.transferData.Lines.filter(product => product.count).map(product => {
      return {
        LineNum: product.LineNum,
        Count: product.count,
        Pallet: product.pallet,
        BatchList: (product.detalle) ? product.detalle : []
      };
    });

    if (TransferRows.length != 0) {
      const recepcionData = {
        DocEntry: this.transferData.DocEntry,
        TransferRows
      };
      this.http.post(this.appSettings.apiSAP + '/api/inventorytransfer/SAP', recepcionData).toPromise().then((data: any) => {
        this.presentToast('Recepcion Concluida', 'success');
        this.transferData = undefined;
        this.transferRequestDocNum = undefined;
        this.products = [];
      }).catch(error => {
        if (error.status == 409) {
          this.presentToast(error.error, "warning");
          this.transferData = undefined;
          this.transferRequestDocNum = undefined;
          this.products = [];
        } else if (error.status == 400) {
          this.presentToast(error.error, "danger");
        } else {
          this.presentToast("Error", "danger")
        }
      }).finally(() => {
        this.hideLoading()
      });
    } else {
      this.presentToast('No hay productos que surtir', 'warning')
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
      // duration: 3000
    });

    await this.load.present()
  }

  hideLoading() {
    // console.log('loading')
    this.load.dismiss()
  }

}
