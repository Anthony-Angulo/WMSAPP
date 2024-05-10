import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { environment } from 'src/environments/environment';
import { SettingsService } from '../../../services/settings.service';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { getCerosFromEtiquetaInventario, getSettingsFileData } from '../../commons';

@Component({
  selector: 'app-beef',
  templateUrl: './beef.page.html',
  styleUrls: ['./beef.page.scss'],
})
export class BeefPage implements OnInit {

  public appSettings: any;

  public productData: any;
  public codigoBarra: string
  public peso: number;
  public detail: any = []
  public cantidadEscaneada: number = 0;
  public cantidadPeso: number = 0;
  public crBars = [];
  public batch: any;
  public load: any;
  public codebarDescription: any;
  public inputs = [];
  public selectedDesc: any;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private receptionService: RecepcionDataService,
    private router: Router,
    private alert: AlertController,
    private loading: LoadingController,
    private platform: Platform,
    private settings: SettingsService
  ) { }

  async ngOnInit() {

    this.productData = this.receptionService.getOrderData();

    this.appSettings = getSettingsFileData(this.platform, this.settings);

    if (this.productData.DeliveryRowDetailList) {
      this.detail = this.productData.DeliveryRowDetailList[0].BatchList
      this.cantidadPeso = this.productData.DeliveryRowDetailList[0].Count
    }

    if (this.productData.cajasEscaneadas) {
      this.cantidadEscaneada = Number(this.productData.cajasEscaneadas)
    } else {
      this.cantidadEscaneada = 0
    }


    if (!this.productData.pesoContado) {
      this.productData.pesoContado = 0
    } else {
      this.cantidadPeso = this.productData.pesoContado
    }

    if (Number(this.productData.U_IL_PesMin) == 0 && Number(this.productData.U_IL_PesMax) == 0) {
      this.productData.U_IL_PesMin = 0
      this.productData.U_IL_PesMax = 100
    }

    await this.presentLoading('Buscando informacion de producto...');

    await Promise.all([
      this.http.get(`${this.appSettings.apiSAP}/api/batch/${this.productData.WhsCode}/${this.productData.ItemCode}`).toPromise(),
      this.http.get(`${environment.apiCCFN}/codeBar/${this.productData.ItemCode}`).toPromise(),
      this.http.get(`${environment.apiCCFN}/crBar/${this.productData.ItemCode}`).toPromise(),
    ]).then(([batch, cBDetail, crBars]):any => {
      this.batch = batch;
      this.productData.cBDetail = cBDetail;
      this.productData.crBars = crBars;
    }).catch((error) => {
      console.log(error)
      this.presentToast(error.error.error, 'danger')
    }).finally(() => {
      this.hideLoading()
    })

    if (this.productData.QryGroup45 == "Y") {
      this.codebarDescription = this.productData.cBDetail.filter(x => x.OriginLocation != null)
      this.codebarDescription.forEach(y => {
        this.inputs.push({
          name: y.OriginLocation,
          type: "radio",
          label: y.OriginLocation,
          value: y.OriginLocation
        })
      });

      this.promptCodeDesc()
      this.presentToast("Selecciona una configuracion", "warning")
    }


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

  public async promptLote(index: number) {
    const alertLote = await this.alert.create({
      header: 'Ingresa Cantidad A Surtir',
      inputs: [
        {
          name: 'cantidad',
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
            if (Number(data.cantidad) > this.detail[index].Quantity) {
              this.presentToast('Excede de la cantidad escaneada', 'warning');
              return
            }
            this.detail[index].Quantity = Number(data.cantidad);
            this.cantidadPeso = this.detail.map(x => x.Quantity).reduce((a, b) => a + b, 0);
          }
        }, {
          text: 'Eliminar',
          handler: () => {
            if (this.cantidadEscaneada != 0) {
              this.detail.splice(index, 1);
              this.cantidadEscaneada = this.detail.length
              this.cantidadPeso = this.detail.map(x => x.Quantity).reduce((a, b) => a + b, 0);
            }
          }
        },

      ]
    });

    await alertLote.present();
  }

  submit() {

    if (this.detail.length == 0) {
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/surtido-sap'])
    }


    this.productData.cajasEscaneadas = this.cantidadEscaneada

    let BatchList = this.detail

    let detalle = [{
      BatchList,
      total: this.cantidadPeso,
      ItemCode: this.productData.ItemCode,
      Count: this.cantidadPeso,
      UomEntry: this.productData.UomEntry
    }]

    this.productData.DeliveryRowDetailList = detalle
    this.productData.crBarsUpdate = this.crBars;
    console.log(this.productData)
    this.receptionService.setReceptionData(this.productData)
    this.router.navigate(['/members/surtido-sap'])
  }

  public getCodeBarCR(): void {

    let madeByUom = this.productData.Uoms.findIndex((x: any) => x.UomEntry == this.productData.UomEntry);

    let isScanned = this.productData.crBars.findIndex((prod: any) => prod.CodeBar == this.codigoBarra.trim());
    if (isScanned < 0) {
      this.presentToast("CR No Esta Registrado", "warning");
      this.peso = 0
      document.getElementById('input-codigo').setAttribute('value', '');
      document.getElementById('input-codigo').focus();
      return
    }

    let alreadyScanned = this.detail.findIndex((y:any) => y.CodeBar == this.codigoBarra.trim());

    if(alreadyScanned >= 0) {
      this.presentToast("CR Ya Fue Escaneado", "warning");
      this.peso = 0
      document.getElementById('input-codigo').setAttribute('value', '');
      document.getElementById('input-codigo').focus();
      return
    }

    let foundInBatch = this.batch.findIndex((code:any) => code.U_IL_CodBar == this.codigoBarra.trim());

    if(foundInBatch < 0) {
      let loteGenerico = this.batch.find((y: any) => y.BatchNum.toUpperCase() == 'SI');

      if (loteGenerico != undefined) {

        this.detail.push({
          Code: loteGenerico.BatchNum,
          Quantity: Number(this.productData.crBars[isScanned].Peso),
          CodeBar: this.codigoBarra.trim(),
          uom: this.productData.Uoms[madeByUom].BaseEntry,
          uomCode: this.productData.Uoms[madeByUom].UomCode
        });

        this.presentToast("Se Escaneo Correctamente", "success");
    }
  } else {
    this.detail.push({
      Code: this.batch[foundInBatch].BatchNum,
      Quantity: Number(this.batch[foundInBatch].Quantity),
      CodeBar: this.batch[foundInBatch].U_IL_CodBar.trim(),
      uom: this.productData.Uoms[madeByUom].BaseEntry,
      uomCode: this.productData.Uoms[madeByUom].UomCode
    });
    this.presentToast("Se Escaneo Correctamente", "success");
  }

  this.crBars.push({CodeBar: this.codigoBarra.trim(), Active: 1})

  this.cantidadEscaneada = this.detail.length
  this.cantidadPeso = this.detail.map((x: any) => x.Quantity).reduce((a, b) => a + b, 0);
  document.getElementById('input-codigo').setAttribute('value', '');
  document.getElementById('input-codigo').focus();
}


  public getDataFromCodeBar(): void {

    if (this.codigoBarra == '') return

    let madeByUom = this.productData.Uoms.findIndex((x: any) => x.UomEntry == this.productData.UomEntry);

    if (this.codigoBarra.trim()[0] == 'C') {
      this.getCodeBarCR();
      return
    }

    let codeBarSettingInd;

    if (this.productData.QryGroup45 == 'Y') {
      codeBarSettingInd = this.productData.cBDetail.findIndex((y: any) => y.OriginLocation == this.selectedDesc);
    } else {
      codeBarSettingInd = this.productData.cBDetail.findIndex((y: any) => y.BarcodeLength == this.codigoBarra.trim().length);
    }

    if (codeBarSettingInd < 0) {
      this.presentToast("El Codigo De Barra No Coincide Con la Configuracion Del Codigo De Barra Del Producto.", "warning");
      this.peso = 0;
      document.getElementById('input-codigo').setAttribute('value', '');
      document.getElementById('input-codigo').focus();
      return
    }

    let pesoDeEtiqueta = this.codigoBarra.substr(this.productData.cBDetail[codeBarSettingInd].WeightPosition - 1, this.productData.cBDetail[codeBarSettingInd].WeightLength);

    if (this.productData.cBDetail[codeBarSettingInd].HasDecimal.data[0] == 1 && this.productData.cBDetail[codeBarSettingInd].UoM == 4) {
      this.peso = Number((Number(pesoDeEtiqueta) / 2.2046).toFixed(2));
    } else if (this.productData.cBDetail[codeBarSettingInd].HasDecimal.data[0] == 1 && this.productData.cBDetail[codeBarSettingInd].UoM == 3) {
      this.peso = Number(pesoDeEtiqueta);
    } else {
      this.peso = getCerosFromEtiquetaInventario(this.productData, pesoDeEtiqueta, codeBarSettingInd);
    }

    if (this.peso < this.productData.U_IL_PesMin || this.peso > this.productData.U_IL_PesMax) {
      console.log(this.peso)
      this.presentToast("El Peso Escaneado No Esta Dentro De Los Parametros De Peso Maximo y Peso Minimo.", "warning");
      this.peso = 0
      document.getElementById('input-codigo').setAttribute('value', '');
      document.getElementById('input-codigo').focus();
      return
    }

    let isScanned = this.detail.findIndex((codeBar: any) => codeBar.CodeBar == this.codigoBarra.trim());
    if (isScanned >= 0) {
      this.presentToast("Este Codigo De Barra Ya Fue Escaneado", "warning");
      this.peso = 0;
      document.getElementById('input-codigo').setAttribute('value', '');
      document.getElementById('input-codigo').focus();
      return
    }

    // if(this.productData.QryGroup51 == 'N') {

      let isCodeBarExist = this.batch.findIndex((codeBar: any) => codeBar.U_IL_CodBar == this.codigoBarra.trim());
  
      if (isCodeBarExist >= 0) {
  
        this.detail.push({
          Code: this.batch[isCodeBarExist].BatchNum,
          Quantity: Number(this.batch[isCodeBarExist].Quantity),
          CodeBar: this.batch[isCodeBarExist].U_IL_CodBar.trim(),
          uom: this.productData.Uoms[madeByUom].BaseEntry,
          uomCode: this.productData.Uoms[madeByUom].UomCode
        });
  
        this.batch.splice(isCodeBarExist, 1);
        this.presentToast("Se Escaneo Correctamente", "success");
      } else {
  
        let loteGenerico = this.batch.find((y: any) => y.BatchNum.toUpperCase() == 'SI');
  
        if (loteGenerico != undefined) {
  
          this.detail.push({
            Code: loteGenerico.BatchNum,
            Quantity: this.peso,
            CodeBar: this.codigoBarra.trim(),
            uom: this.productData.Uoms[madeByUom].BaseEntry
          });
  
          this.presentToast("Se Escaneo Correctamente", "success");
        } else {
          this.presentToast("El Codigo de Barra No Fue Encontrado En Inventario O No Hay Cantidad Suficiente En Lote Generico. Revisar Con Auditoria.", "warning");
        }
      }
    // } else {
    //   this.detail.push({
    //     Code: 'SI',
    //     Quantity: this.peso,
    //     CodeBar: this.codigoBarra.trim(),
    //     uom: this.productData.Uoms[madeByUom].BaseEntry
    //   });
    // }




    this.cantidadEscaneada = this.detail.length
    this.cantidadPeso = this.detail.map((x: any) => x.Quantity).reduce((a, b) => a + b, 0);
    document.getElementById('input-codigo').setAttribute('value', '');
    document.getElementById('input-codigo').focus();


  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      position: "middle",
      color: color,
      duration: 2000
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
