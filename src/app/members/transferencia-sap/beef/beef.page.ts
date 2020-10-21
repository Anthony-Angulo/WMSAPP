import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '../../../services/settings.service';
import { Platform } from '@ionic/angular';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { getSettingsFileData, getCerosFromEtiqueta, getValidPercentage } from '../../commons';

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

    await this.presentLoading('Buscando Lotes de producto...')

    this.http.get(this.appSettings.apiSAP + '/api/batch/' + this.productData.FromWhsCod + '/' + this.productData.ItemCode).toPromise().then((data: any) => {
      this.availableBatchs = data;
    }).catch((error: any) => {
      this.presentToast(error.error.error, 'danger')
    }).finally(() => {
      this.hideLoading()
    });


    if (this.productData.QryGroup45 == "Y") {
      this.codeBarSetting = this.productData.cBDetail.filter((x: any) => x.proveedor != null)
      this.codeBarSetting.forEach(y => {
        this.alertCodeBarinputs.push({
          name: y.proveedor,
          type: "radio",
          label: y.proveedor,
          value: y.proveedor
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

  public getDataFromCodeBar(): void {

    if (this.tarima == undefined || this.tarima == '') {
      this.presentToast("Debes Ingresar Un Numero De Tarima", "warning");
      return
    }

    if (this.codeBarInput != '') {

      let codeBarSettingInd;

      if (this.productData.QryGroup45 == 'Y') {
        codeBarSettingInd = this.productData.cBDetail.findIndex((y: any) => y.proveedor == this.selectedCodebarSetting);
      } else {
        codeBarSettingInd = this.productData.cBDetail.findIndex((y: any) => y.length == this.codeBarInput.trim().length);
      }

      if (codeBarSettingInd < 0) {
        this.presentToast("El Codigo De Barra No Coincide Con la Configuracion Del Codigo De Barra Del Producto.", "warning");
        this.peso = 0;
        document.getElementById('input-codigo').setAttribute('value', '');
        document.getElementById('input-codigo').focus();
        return
      }

      let pesoDeEtiqueta = this.codeBarInput.substr(this.productData.cBDetail[codeBarSettingInd].peso_pos - 1, this.productData.cBDetail[codeBarSettingInd].peso_length);

      if (this.productData.cBDetail[codeBarSettingInd].maneja_decimal == 1 && this.productData.cBDetail[codeBarSettingInd].UOM_id == 4) {
        this.peso = Number((Number(pesoDeEtiqueta) / 2.2046).toFixed(2));
      } else if (this.productData.cBDetail[codeBarSettingInd].maneja_decimal == 1 && this.productData.cBDetail[codeBarSettingInd].UOM_id == 3) {
        this.peso = Number(pesoDeEtiqueta);
      } else {
        this.peso = getCerosFromEtiqueta(this.productData, pesoDeEtiqueta, codeBarSettingInd);
      }

      if (this.peso < this.productData.U_IL_PesMin && this.peso > this.productData.U_IL_PesMax) {
        this.presentToast("El Peso Escaneado No Esta Dentro De Los Parametros De Peso Maximo y Peso Minimo.", "warning");
        this.peso = 0
        document.getElementById('input-codigo').setAttribute('value', '');
        document.getElementById('input-codigo').focus();
        return
      }

      let isScanned = this.batchDetail.findIndex((codeBar: any) => codeBar.CodeBar == this.codeBarInput.trim());
      let isCodeBarExist = this.availableBatchs.findIndex((codeBar: any) => codeBar.U_IL_CodBar == this.codeBarInput.trim());

      if (isScanned >= 0) {
        this.presentToast("Este Codigo De Barra Ya Fue Escaneado", "warning");
        this.peso = 0;
        document.getElementById('input-codigo').setAttribute('value', '');
        document.getElementById('input-codigo').focus();
        return
      }

      if (isCodeBarExist >= 0) {

        this.batchDetail.push({
          Code: this.availableBatchs[isCodeBarExist].BatchNum,
          Quantity: Number(this.availableBatchs[isCodeBarExist].Quantity),
          CodeBar: this.codeBarInput.trim()
        });

        this.availableBatchs.splice(isCodeBarExist, 1);
        this.presentToast("Se Escaneo Correctamente", "success");
      } else {

        let loteGenerico = this.availableBatchs.find((y: any) => Number(y.Quantity) > 50);

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

    }

    this.cantidadEscaneada = this.batchDetail.length
    this.cantidadPeso = this.batchDetail.map((x: any) => x.Quantity).reduce((a, b) => a + b, 0);
    document.getElementById('input-codigo').setAttribute('value', '');
    document.getElementById('input-codigo').focus();
  }


  public eliminar(index: number) {
    this.batchDetail.splice(index, 1)
    this.cantidadEscaneada = this.batchDetail.length
    this.cantidadPeso = this.batchDetail.map((x: any) => x.Quantity).reduce((a, b) => a + b, 0);
  }

  public submit() {

    this.productData.cajasEscaneadas = this.cantidadEscaneada;
    this.productData.pesoContado = this.cantidadPeso;

    if(this.cantidadEscaneada == 0) {
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
