import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SettingsService } from '../../../services/settings.service';
import { NavExtrasService } from '../../../services/nav-extras.service';
import { validateCodeBar, getCerosFromEtiquetaInventario, getSettingsFileData } from '../../commons';
import {
  Platform,
  ToastController,
  LoadingController,
  AlertController
}
  from '@ionic/angular';
  declare var parseBarcode: any;
const USER = 'user';

@Component({
  selector: 'app-beef',
  templateUrl: './beef.page.html',
  styleUrls: ['./beef.page.scss'],
})
export class BeefPage implements OnInit {

  public productInfo: any;
  public appSettings: any;
  public warehouseCode: string;
  public apiSAPURL: string;
  public codigoBarra: string;
  public codeBarDetails = [];
  public pesoDeEtiqueta: number;
  public cajasEscaneadas: number = 0;
  public lote: string;
  public location: string;
  public total: number = 0;
  public load: any;
  public manual: any;
  public rows = [];
  codebarDescription: any;
  inputs = [];
  selectedDesc: any;

  constructor(private navExtras: NavExtrasService,
    private http: HttpClient,
    private router: Router,
    private platform: Platform,
    private loading: LoadingController,
    private alert: AlertController,
    private settings: SettingsService,
    private toastController: ToastController,
    private storage: Storage) { }

  async ngOnInit() {
    this.productInfo = this.navExtras.getInventoryProduct();
    this.appSettings = getSettingsFileData(this.platform, this.settings);

    await this.presentLoading("Obteniendo codigos de barra..");

    Promise.all([
      this.http.get(`${environment.apiCCFN}/codeBar/${this.productInfo.Detail.ItemCode}`).toPromise(),
      this.http.get(`${environment.apiCCFN}/crBar/${this.productInfo.Detail.ItemCode}`).toPromise(),
    ]).then(([cBDetail, crBars] : any) => {
      if (cBDetail.length != 0) {
        this.productInfo.cBDetail = cBDetail;
      } else {
        this.productInfo.cBDetaiil = [];
      }
      this.productInfo.crBars = crBars;
    }).catch((err) => {
      this.presentToast(err.error, "danger");
    }).finally(() => {
      this.hideLoading();
    });

    if (Number(this.productInfo.Detail.U_IL_PesMin) == 0 && Number(this.productInfo.Detail.U_IL_PesMax) == 0) {
      this.productInfo.Detail.U_IL_PesMin = 0
      this.productInfo.Detail.U_IL_PesMax = 100
    }

    if (this.productInfo.Detail.QryGroup45 == "Y") {
      this.codebarDescription = this.productInfo.cBDetail.filter(x => x.OriginLocation != null)
      this.codebarDescription.forEach(y => {
        this.inputs.push({
          name: y.OriginLocation,
          type: "radio",
          label: y.OriginLocation,
          value: y.OriginLocation
        })
      })

      this.promptCodeDesc()
      this.presentToast("Selecciona una configuracion", "warning")
    }

    console.log(this.productInfo);

  }

  async promptCodeDesc() {
    const alert = await this.alert.create({
      header: 'Configuracion',
      inputs: this.inputs,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Aceptar',
          handler: (data) => {
            this.selectedDesc = data
          }
        }
      ]
    });

    await alert.present();
  }

  productDetail() {
    this.router.navigate(['/members/inventory-product-detail']);
  }

  async weightManual() {

    if(!this.manual) return

    const alert = await this.alert.create({
      header: 'Peso Manual',
      message: 'Ingresa un peso',
      inputs: [
        {
          name: 'peso',
          type: 'text',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Aceptar',
          handler: (data) => {
            this.codeBarDetails.push({
              codebar: 'NA',
              Lote: this.lote,
              visual: 'NA',
              Quantity: Number(data.peso)
            });
            this.manual = false
            this.total = this.codeBarDetails.map(x => x.Quantity).reduce((a, b) => a + b, 0);
          }
        }
      ]
    });

    await alert.present();
  }

  getGS1Data() {

    if (this.codigoBarra == '') return

    try {
      let answer = parseBarcode(this.codigoBarra);

      if(this.productInfo.Detail.SuppCatNum != answer.parsedCodeItems[0].data) {
        this.presentToast("El codigo de manufactura no coincide con el codigo escaneado. Contactar Datos Maestros.", "warning");
        this.pesoDeEtiqueta = 0;
        document.getElementById('input-codigo').setAttribute('value', '');
        document.getElementById('input-codigo').focus();
        return
      }

      this.getDataFromEtiqueta();
    }catch(error) {
      this.presentToast("Esctructura GS1 mal estrucurada.", "warning");
      this.getDataFromEtiqueta();
    }
  }

  public getDataFromEtiqueta(): void {

    if (this.codigoBarra == '') return

    validateCodeBar(environment.apiCCFN, this.codigoBarra, this.productInfo.headerId, this.http).then((value: boolean) => {

      if (this.codigoBarra.trim()[0] == 'C') {
        console.log(1)
       this.getcrBarData();
       return
      }

      if (!value) {

        let codeBarSettingInd;

        if (this.productInfo.Detail.QryGroup45 == 'Y') {
          codeBarSettingInd = this.productInfo.cBDetail.findIndex((y: any) => y.OriginLocation == this.selectedDesc);
        } else {
          codeBarSettingInd = this.productInfo.cBDetail.findIndex((y: any) => y.BarcodeLength == this.codigoBarra.trim().length);
        }

        if (codeBarSettingInd < 0) {
          this.presentToast("El Codigo De Barra No Coincide Con la Configuracion Del Codigo De Barra Del Producto.", "warning");
          this.pesoDeEtiqueta = 0;
          document.getElementById('input-codigo').setAttribute('value', '');
          document.getElementById('input-codigo').focus();
          return
        }

        let pesoDeEtiqueta = this.codigoBarra.substr(this.productInfo.cBDetail[codeBarSettingInd].WeightPosition - 1, this.productInfo.cBDetail[codeBarSettingInd].WeightLength);

        if (this.productInfo.cBDetail[codeBarSettingInd].HasDecimal.data[0] == 1 && this.productInfo.cBDetail[codeBarSettingInd].UoM == 4) {
          this.pesoDeEtiqueta = Number((Number(pesoDeEtiqueta) / 2.2046).toFixed(2));
        } else if (this.productInfo.cBDetail[codeBarSettingInd].HasDecimal.data[0] == 1 && this.productInfo.cBDetail[codeBarSettingInd].UoM == 3) {
          this.pesoDeEtiqueta = Number(pesoDeEtiqueta);
        } else {
          this.pesoDeEtiqueta = getCerosFromEtiquetaInventario(this.productInfo, pesoDeEtiqueta, codeBarSettingInd);
        }

        if (this.pesoDeEtiqueta < this.productInfo.Detail.U_IL_PesMin || this.pesoDeEtiqueta > this.productInfo.Detail.U_IL_PesMax) {
          this.presentToast("El Peso Escaneado No Esta Dentro De Los Parametros De Peso Maximo y Peso Minimo.", "warning");
          this.pesoDeEtiqueta = 0
          document.getElementById('input-codigo').setAttribute('value', '');
          document.getElementById('input-codigo').focus();
          return
        }

        let isScanned = this.codeBarDetails.findIndex((codeBar: any) => codeBar.codebar == this.codigoBarra.trim());

        if (isScanned >= 0) {
          this.presentToast("Este Codigo De Barra Ya Fue Escaneado", "warning");
          this.pesoDeEtiqueta = 0;
          document.getElementById('input-codigo').setAttribute('value', '');
          document.getElementById('input-codigo').focus();
          return
        }

        this.codeBarDetails.push({
          codebar: this.codigoBarra.trim(),
          Lote: this.lote,
          visual: this.codigoBarra.substr(this.codigoBarra.length - 14).trim(),
          Quantity: this.pesoDeEtiqueta
        });

        this.presentToast("Se Escaneo Correctamente", "success");

      } else {
        this.presentToast("El codigo ya existe. Intenta de nuevo", "warning")
      }

      this.total = this.codeBarDetails.map(x => x.Quantity).reduce((a, b) => a + b, 0);
      document.getElementById('input-codigo').setAttribute('value', '');

    });
  }

  public getcrBarData(): void {
    let isScanned = this.codeBarDetails.findIndex((codeBar: any) => codeBar.codebar == this.codigoBarra.trim());

    if (isScanned >= 0) {
      this.presentToast("Este Codigo De Barra Ya Fue Escaneado", "warning");
      this.pesoDeEtiqueta = 0;
      document.getElementById('input-codigo').setAttribute('value', '');
      document.getElementById('input-codigo').focus();
      return
    }

    let foundInCrs = this.productInfo.crBars.findIndex((x:any) => x.CodeBar == this.codigoBarra.trim());
    
    if(foundInCrs >= 0) {
      this.codeBarDetails.push({
        codebar: this.productInfo.crBars[foundInCrs].CodeBar,
        Lote: this.lote,
        visual: this.productInfo.crBars[foundInCrs].CodeBar,
        Quantity: Number(this.productInfo.crBars[foundInCrs].Peso)
      });
    } else {
      this.presentToast("Codigo de barra CR no encontrado.","warning");
    }

    this.total = this.codeBarDetails.map(x => x.Quantity).reduce((a, b) => a + b, 0);
    document.getElementById('input-codigo').setAttribute('value', '');
  }

  async saveInventory() {

    if(this.codeBarDetails.length == 0) {
      this.presentToast("No hay registros para enviar", "warning");
      return
    }

      let codeBars = []

      let user = await this.storage.get(USER);
      
      await this.presentLoading("Guardando...");


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
  
          let datos = [
            this.productInfo.Detail.ItemCode,
            this.productInfo.Detail.ItemName,
            this.total,
            0,
            this.productInfo.Detail.ManBtchNum,
            this.productInfo.Detail.U_IL_TipPes,
            user.id,
            this.productInfo.headerId,
          ]
  
          return this.http.post(`${environment.apiCCFN}/inventoryProduct`, datos).toPromise()
        } 
      }).then((res: any) => {
  
        let detail = {
          quantity: this.total,
          zone: this.productInfo.location,
          userId: user.id,
          inventoryProductId: (res.insertId == 0) ? this.productInfo.productId : res.insertId
        }
  
        return this.http.post(`${environment.apiCCFN}/inventoryDetail`, detail).toPromise()
  
      }).then((res: any) => {

        if(this.productInfo.Detail.ManBtchNum == 'Y') {
          codeBars = this.codeBarDetails.map(x => {
            return [
              x.Quantity,
              x.Lote,
              x.codebar,
              res.id
            ]
          })
        }
  
        return this.http.post(`${environment.apiCCFN}/inventoryCodeBar`, codeBars).toPromise()
      }).then((res: any) => {
        if(res) {
          this.presentToast('Guardado Correctamente', 'success')
          this.total = 0
          this.router.navigate(['/members/full-inventory'])
        }
      }).catch((err: any) => {
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
