import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { Platform } from '@ionic/angular';
import { SettingsService } from './../../services/settings.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { getSettingsFileData, getValidPercentage } from '../commons';

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
  public crBars: any = [];
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
      this.crBars = this.transferData.Lines[index].crBarsUpdate;
      this.products.push(productsScanned)
    }

    console.log(this.products)
    this.receptionService.setReceptionData(null)

  }


  /* Metodo para traer informacion sobre solicitud de transferencia y descripcion de codigos de barra de productos de tipo variado */
  async getOrden() {

    await this.presentLoading('Buscando Solicitud....')



    this.http.get(`${this.appSettings.apiSAP}/api/InventoryTransferRequest/DeliverySAPNew/${this.transferRequestDocNum}`).toPromise().then((transferData: any) => {
      this.transferData = transferData;
      // let validOrder = this.transferData.Lines.findIndex(x => x.FromWhsCod == this.transferData.Filler && x.WhsCode == this.transferData.ToWhsCode)
      // if (validOrder >= 0) {
      //   this.presentToast('Orden de transferencia mal creada. Revisar almacenes de salida y destino.', 'warning')
      //   return
      // } else {
        return this.transferData.Lines.filter((x: any) => x.U_IL_TipPes != 'F').map((x: any) => x.ItemCode);
      // }
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

    this.receptionService.setOrderData(this.transferData.Lines[index]);

    if (this.transferData.Lines[index].U_IL_TipPes == 'V') {
      this.router.navigate(['members/transferencia-beef'])
    } else if (this.transferData.Lines[index].ManBtchNum == 'Y') {
      this.router.navigate(['members/transferencia-abarrotes-batch'])
    } else {
      this.router.navigate(['/members/transferencia-abarrotes'])
    }


    this.search = '';
  }

  

  public searchProductByCb() {

    if (this.search == '') return

    let found;

    let index = this.transferData.Lines.findIndex(x => {
      found = x.CodeBars.findIndex(y => y.BcdCode == this.search)
      if (found > -1) {
        return true
      } else {
        return false
      }
    });

    // console.log(this.transferData.Lines[index].CodeBars[found])

    if (index < 0) {
      this.presentToast("Producto no fue encontrado en la lista.", "warning");
      this.ctd = null;
      this.tarima = '';
      this.search = '';
      return
    }

    if(this.transferData.Lines[index].CodeBars[found].UomEntry != this.transferData.Lines[index].UomEntry) {
      this.presentToastmid("La unidad de medida escaneada no es igual a la del pedido.", "warning");
    }

    let total = Number(this.transferData.Lines[index].CodeBars[found].BaseQty) * Number(this.ctd);

    if(total > this.transferData.Lines[index].OpenInvQty) {
      this.presentToast("La Cantidad Registrada Excede La Cantidad Requerida", "danger");
      return;
    }


    if (this.transferData.Lines[index].LineStatus == 'C') {
      this.presentToast("Producto ya fue transferido completamente.", "warning");
      this.ctd = null;
      this.tarima = '';
      this.search = '';
      return
    }

    this.transferData.Lines[index].pallet = this.tarima;
    this.transferData.Lines[index].ctd = this.ctd;
    
    this.receptionService.setOrderData(this.transferData.Lines[index])


    if (this.transferData.Lines[index].ManBtchNum == 'Y') {
      this.router.navigate(['members/transferencia-abarrotes-batch'])
      this.ctd = null;
      this.tarima = '';
      this.search = '';
    } else if (this.transferData.Lines[index].U_IL_TipPes == 'V') {
      this.router.navigate(['members/transferencia-beef'])
    } else {
      console.log(getValidPercentage(this.transferData.Lines[index], this.appSettings.porcentaje))

      if (this.ctd > getValidPercentage(this.transferData.Lines[index], this.appSettings.porcentaje)) {
        this.presentToast("Cantidad Ingresada Excede De La Cantidad Solicitada", "warning");
        this.ctd = null;
        this.tarima = '';
        this.search = '';
        return;
      }
      
      this.http.get(`${this.appSettings.apiSAP}/api/batch/${this.transferData.Lines[index].FromWhsCod}/${this.transferData.Lines[index].ItemCode}`).toPromise()
        .then((r:any) => {
          if(r.stock <= 0) {
            this.presentToast(`Stock En Negativo Para el Producto: ${this.transferData.Lines[index].ItemCode}`, "warning");
          } else if(this.ctd > r.stock) {
            this.presentToast(`Stock Insuficiente Para el Producto: ${this.transferData.Lines[index].ItemCode} Stock: ${r.stock}`, "warning");
          } else {
            this.transferData.Lines[index].count = this.ctd;
            this.transferData.Lines[index].pallet = this.tarima;
          }
        }).catch((err) => {
          this.presentToast(`Error Al Buscar Stock Para El Producto ${this.transferData.Lines[index].ItemCode}`,"danger");
        }).finally(() => {
          this.ctd = null;
          this.tarima = '';
          this.search = '';
        });
    }

    document.getElementById('input-codigo').setAttribute('value', '');

  }


  /* Metodo para enviar al usuario a la pagina de producto a transferir */
  public goToProductPage(indexOfProduct: number) {

    this.transferData.Lines[indexOfProduct].DocNum = this.transferData.DocNum;

    this.receptionService.setOrderData(this.transferData.Lines[indexOfProduct])

    if (this.transferData.Lines[indexOfProduct].ManBtchNum == 'Y') {
      this.router.navigate(['members/transferencia-beef'])
    // } else if (this.transferData.Lines[indexOfProduct].U_IL_TipPes == 'F') {
    //   this.router.navigate(['members/transferencia-abarrotes-batch'])
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
        ItemCode: product.ItemCode,
        ItemName: product.ItemName,
        UomCode: product.UomCode,
        BatchList: (product.detalle) ? product.detalle : []
      };
    });

    if (TransferRows.length != 0) {
      const recepcionData = {
        DocEntry: this.transferData.DocEntry,
        serie: this.transferData.Filler,
        TransferRows
      };
      this.http.post(this.appSettings.apiSAP + '/api/inventorytransfer/SAP', recepcionData).toPromise().then((data: any) => {
        // this.sendUpdateCr();
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

  // async sendUpdateCr() {
  //   await this.http.put(`${environment.apiCCFN}/crbar/updateCr`, this.crBars).toPromise()
  // }



  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      color: color,
      duration: 4000,
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
