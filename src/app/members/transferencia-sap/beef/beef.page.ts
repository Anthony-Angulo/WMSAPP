import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '../../../services/settings.service';
import { Platform } from '@ionic/angular';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { getSettingsFileData, getCerosFromEtiquetaInventario } from '../../commons';

@Component({
  selector: 'app-beef',
  templateUrl: './beef.page.html',
  styleUrls: ['./beef.page.scss'],
})

export class BeefPage implements OnInit {

  public productData: any;
  public codeBarInput: string;
  public peso: number;
  public batchDetail: any = [];
  public cantidadEscaneada: number = 0;
  public cantidadPeso: number = 0;
  public crBars = [];
  public availableBatchs: any;
  public tarima: string;
  public loadController: any;
  public appSettings: any;
  public codeBarSetting: any;
  public alertCodeBarinputs: any = [];
  public selectedCodebarSetting: any;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private receptionService: RecepcionDataService,
    private router: Router,
    private alert: AlertController,
    private platform: Platform,
    private settings: SettingsService,
    private loading: LoadingController
  ) { }

  async ngOnInit() {

    this.productData = this.receptionService.getOrderData();

    console.log(this.productData)
    this.appSettings = getSettingsFileData(this.platform, this.settings);

    if (!this.productData.detalle) {
      this.productData.detalle = [];
    } else {
      this.batchDetail = this.productData.detalle;
    }

    if (this.productData.cajasEscaneadas) {
      this.cantidadEscaneada = this.productData.cajasEscaneadas;
    } else {
      this.cantidadEscaneada = 0;
    }

    if (!this.productData.pesoContado) {
      this.productData.pesoContado = 0;
    } else {
      this.cantidadPeso = this.productData.pesoContado;
    }

    if (!this.productData.pallet) {
      this.productData.pallet = '';
    }

    if (Number(this.productData.U_IL_PesMin) == 0 && Number(this.productData.U_IL_PesMax) == 0) {
      this.productData.U_IL_PesMin = 0;
      this.productData.U_IL_PesMax = 100;
    }

    await this.presentLoading('Buscando informacion de producto...');


    await Promise.all([
      this.http.get(`${this.appSettings.apiSAP}/api/batch/${this.productData.FromWhsCod}/${this.productData.ItemCode}`).toPromise(),
      this.http.get(`${environment.apiCCFN}/codeBar/${this.productData.ItemCode}`).toPromise(),
      this.http.get(`${environment.apiCCFN}/crBar/${this.productData.ItemCode}`).toPromise(),
    ]).then(([batch, cBDetail, crBars]): any => {
      this.availableBatchs = batch;
      this.productData.cBDetail = cBDetail;
      this.productData.crBars = crBars;
    }).catch((error) => {
      console.log(error)
      this.presentToast(error.error.error, 'danger')
    }).finally(() => {
      this.hideLoading()
    })


    if (this.productData.QryGroup45 == "Y") {
      this.codeBarSetting = this.productData.cBDetail.filter((x: any) => x.OriginLocation != null)
      this.codeBarSetting.forEach(y => {
        this.alertCodeBarinputs.push({
          name: y.OriginLocation,
          type: "radio",
          label: y.OriginLocation,
          value: y.OriginLocation
        })
      })

      this.promptCodeDesc()
    }


  }

  async promptCodeDesc() {
    const alert = await this.alert.create({
      header: 'Configuracion De Codigo de Barra',
      inputs: this.alertCodeBarinputs,
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
            this.selectedCodebarSetting = data;
          }
        }
      ]
    });

    await alert.present();
  }

  public getCodeBarCR(): void {

    let isScanned = this.productData.crBars.findIndex((prod: any) => prod.CodeBar == this.codeBarInput.trim());
    if (isScanned < 0) {
      this.presentToast("CR No Esta Registrado", "warning");
      this.peso = 0
      document.getElementById('input-codigo').setAttribute('value', '');
      document.getElementById('input-codigo').focus();
      return
    }

    let alreadyScanned = this.batchDetail.findIndex((y: any) => y.CodeBar == this.codeBarInput.trim());

    if (alreadyScanned >= 0) {
      this.presentToast("CR Ya Fue Escaneado", "warning");
      this.peso = 0
      document.getElementById('input-codigo').setAttribute('value', '');
      document.getElementById('input-codigo').focus();
      return
    }

    let foundInBatch = this.availableBatchs.findIndex((code: any) => code.U_IL_CodBar == this.codeBarInput.trim());

    if (foundInBatch < 0) {
      let loteGenerico = this.availableBatchs.find((y: any) => y.BatchNum == 'SI');

      if (loteGenerico != undefined) {

        this.batchDetail.push({
          Code: loteGenerico.BatchNum,
          Quantity: this.productData.crBars[isScanned].Peso,
          CodeBar: this.codeBarInput.trim()
        });

        this.presentToast("Se Escaneo Correctamente", "success");
      }
    } else {
      this.batchDetail.push({
        Code: this.availableBatchs[foundInBatch].BatchNum,
        Quantity: Number(this.availableBatchs[foundInBatch].Quantity),
        CodeBar: this.codeBarInput.trim()
      });
      this.presentToast("Se Escaneo Correctamente", "success");
    }

    this.crBars.push({CodeBar: this.codeBarInput.trim(), Active: 1})

    this.cantidadEscaneada = this.batchDetail.length
    this.cantidadPeso = this.batchDetail.map((x: any) => x.Quantity).reduce((a, b) => a + b, 0);
    document.getElementById('input-codigo').setAttribute('value', '');
    document.getElementById('input-codigo').focus();
  }

  public getDataFromCodeBar(): void {

    if (this.codeBarInput == '') return

    if (this.tarima == undefined || this.tarima == '') {
      this.presentToast("Debes Ingresar Un Numero De Tarima", "warning");
      return
    }

    if (this.codeBarInput.trim()[0] == 'C') {
      this.getCodeBarCR();
      return
    }

    let codeBarSettingInd;

    if (this.productData.QryGroup45 == 'Y') {
      codeBarSettingInd = this.productData.cBDetail.findIndex((y: any) => y.OriginLocation == this.selectedCodebarSetting);
    } else {
      codeBarSettingInd = this.productData.cBDetail.findIndex((y: any) => y.BarcodeLength == this.codeBarInput.trim().length);
    }

    if (codeBarSettingInd < 0) {
      this.presentToast("El Codigo De Barra No Coincide Con la Configuracion Del Codigo De Barra Del Producto.", "warning");
      this.peso = 0;
      document.getElementById('input-codigo').setAttribute('value', '');
      document.getElementById('input-codigo').focus();
      return
    }

    let pesoDeEtiqueta = this.codeBarInput.substr(this.productData.cBDetail[codeBarSettingInd].WeightPosition - 1, this.productData.cBDetail[codeBarSettingInd].WeightLength);

    if (this.productData.cBDetail[codeBarSettingInd].HasDecimal.data[0] == 1 && this.productData.cBDetail[codeBarSettingInd].UoM == 4) {
      this.peso = Number((Number(pesoDeEtiqueta) / 2.2046).toFixed(2));
    } else if (this.productData.cBDetail[codeBarSettingInd].HasDecimal.data[0] == 1 && this.productData.cBDetail[codeBarSettingInd].UoM == 3) {
      this.peso = Number(pesoDeEtiqueta);
    } else {
      this.peso = getCerosFromEtiquetaInventario(this.productData, pesoDeEtiqueta, codeBarSettingInd);
    }

    if (this.peso < this.productData.U_IL_PesMin || this.peso > this.productData.U_IL_PesMax) {
      this.presentToast("El Peso Escaneado No Esta Dentro De Los Parametros De Peso Maximo y Peso Minimo.", "warning");
      this.peso = 0
      document.getElementById('input-codigo').setAttribute('value', '');
      document.getElementById('input-codigo').focus();
      return
    }

    let isScanned = this.batchDetail.findIndex((codeBar: any) => codeBar.CodeBar == this.codeBarInput.trim());
    if (isScanned >= 0) {
      this.presentToast("Este Codigo De Barra Ya Fue Escaneado", "warning");
      this.peso = 0;
      document.getElementById('input-codigo').setAttribute('value', '');
      document.getElementById('input-codigo').focus();
      return
    }

    if(this.productData.QryGroup51 == 'N') { 

      let isCodeBarExist = this.availableBatchs.findIndex((codeBar: any) => codeBar.U_IL_CodBar == this.codeBarInput.trim());

      if (isCodeBarExist >= 0) {
  
        this.batchDetail.push({
          Code: this.availableBatchs[isCodeBarExist].BatchNum,
          Quantity: Number(this.availableBatchs[isCodeBarExist].Quantity),
          CodeBar: this.codeBarInput.trim()
        });
  
        this.availableBatchs.splice(isCodeBarExist, 1);
        this.presentToast("Se Escaneo Correctamente", "success");
      } else {
  
        let loteGenerico = this.availableBatchs.find((y: any) => y.BatchNum == 'SI' || y.BatchNum == 'si');
  
        if (loteGenerico != undefined) {
  
          this.batchDetail.push({
            Code: loteGenerico.BatchNum,
            Quantity: this.peso,
            CodeBar: this.codeBarInput.trim()
          });
  
          this.presentToast("Se Escaneo Correctamente", "success");
        } else {
          this.presentToast("El Codigo de Barra No Fue Encontrado En Inventario O No Hay Cantidad Suficiente En Lote Generico. Revisar Con Auditoria.", "warning");
        }
      }
    } else {
      this.batchDetail.push({
        Code: this.codeBarInput.substr(this.codeBarInput.length - 36),
        Quantity: this.peso,
        CodeBar: this.codeBarInput.trim()
      });
    }



    this.cantidadEscaneada = this.batchDetail.length
    this.cantidadPeso = this.batchDetail.map((x: any) => x.Quantity).reduce((a, b) => a + b, 0);
    document.getElementById('input-codigo').setAttribute('value', '');
    document.getElementById('input-codigo').focus();
  }

  async imprimirTarima() {
    await this.presentLoading('Imprimiendo etiqueta...');

    this.http.get(`${environment.apiSAP}/api/Impresion/PruebaReciboTarima?Itemcode=${this.productData.ItemCode}&Total=${Number(this.cantidadPeso)}&UoM=${this.productData.UomEntry}
    &DocNum=${this.productData.DocNum}&Cajas=${Number(this.cantidadEscaneada)}&printer=${this.appSettings.IpImpresora}`).toPromise()
      .then(() => {
        this.presentToast("Se imprimio Correctamente", "success");
      }).catch((error) => {
        this.presentToast(error.error.error, 'danger')
      }).finally(() => {
        this.hideLoading()
      })
  }


  public eliminar(index: number) {
    this.batchDetail.splice(index, 1)
    this.cantidadEscaneada = this.batchDetail.length
    this.cantidadPeso = this.batchDetail.map((x: any) => x.Quantity).reduce((a, b) => a + b, 0);
  }

  public submit() {

    this.productData.cajasEscaneadas = this.cantidadEscaneada;
    this.productData.pesoContado = this.cantidadPeso;

    if (this.cantidadEscaneada == 0) {
      this.productData.count = this.cantidadEscaneada;
      this.receptionService.setReceptionData(this.productData);
      this.router.navigate(['/members/transferencia-sap']);
      return
    }

    let madeByUom = this.productData.Uoms.findIndex((x: any) => x.UomEntry == this.productData.UomEntry);

    if (this.productData.UomEntry == this.productData.Uoms[madeByUom].BaseEntry) {
      this.productData.count = this.batchDetail.map((lote: any) => lote.Quantity).reduce((a, b) => a + b, 0);
    } else {
      this.productData.count = this.cantidadEscaneada;
    }

    this.productData.pallet = this.tarima;
    this.productData.detalle = this.batchDetail;
    this.productData.crBarsUpdate = this.crBars;
    this.receptionService.setReceptionData(this.productData)
    this.router.navigate(['/members/transferencia-sap'])

  }


  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      position: "middle",
      color: color,
      duration: 4000
    });
    toast.present();
  }

  async presentLoading(msg) {
    this.loadController = await this.loading.create({
      message: msg,
    });

    await this.loadController.present()
  }

  hideLoading() {
    this.loadController.dismiss()
  }

}
