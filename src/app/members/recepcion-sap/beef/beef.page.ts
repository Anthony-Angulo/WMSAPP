import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { Router } from '@angular/router';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { SettingsService } from '../../../services/settings.service';
import { Platform } from '@ionic/angular';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { getSettingsFileData, getCerosFromEtiquetaInventario } from '../../commons';
import { Storage } from '@ionic/storage';
import { isComponent } from '@angular/core/src/render3/util';
declare var parseBarcode: any;
const TOKEN_KEY = 'auth-token';

@Component({
  selector: 'app-beef',
  templateUrl: './beef.page.html',
  styleUrls: ['./beef.page.scss'],
})
export class BeefPage implements OnInit {

  public appSettings: any;

  productData: any
  codigoBarra
  peso
  FechaCad: String
  FechaProd: String
  detail = []
  crBars = [];
  cantidadEscaneada: number = 0
  cantidadPeso: number = 0
  lote: any
  load
  data
  porcentaje: any;
  apiSAP: string;
  codebarDescription: any;
  inputs = [];
  selectedDesc: any;
  token: any;

  constructor(
    private http: HttpClient,
    private navExtras: NavExtrasService,
    private toastController: ToastController,
    private receptionService: RecepcionDataService,
    private router: Router,
    private platform: Platform,
    private settings: SettingsService,
    private loading: LoadingController,
    private alert: AlertController,
    private storage: Storage
  ) { }

  async ngOnInit() {

    this.productData = this.receptionService.getOrderData()

    console.log(this.productData)

    this.appSettings = getSettingsFileData(this.platform, this.settings);



    // var date = new Date();
    // date = new Date(date.setFullYear(date.getFullYear() + 1));
    // this.FechaCad = date.toISOString();
    // this.FechaProd = date.toISOString();

    if (!this.productData.detalle) {
      this.productData.detalle = []
    } else {
      this.detail = this.productData.detalle
    }

    if (!this.productData.cajasEscaneadas) {
      this.productData.cajasEscaneadas = 0
    } else {
      this.cantidadEscaneada = this.productData.cajasEscaneadas
    }

    if (!this.productData.pesoContado) {
      this.productData.pesoContado = 0
    } else {
      this.cantidadPeso = this.productData.pesoContado
    }

    if (Number(this.productData.Detail.U_IL_PesMin) == 0 && Number(this.productData.Detail.U_IL_PesMax) == 0) {
      this.productData.Detail.U_IL_PesMin = 0
      this.productData.Detail.U_IL_PesMax = 100
    }

    await this.presentLoading('Buscando informacion de producto...');

    await Promise.all([
      this.http.get(`${this.appSettings.apiSAP}/api/batch/${this.productData.WhsCode}/${this.productData.ItemCode}`).toPromise(),
      this.http.get(`${environment.apiCCFN}/codeBar/${this.productData.ItemCode}`).toPromise(),
      this.http.get(`${environment.apiCCFN}/crBar/${this.productData.ItemCode}`).toPromise(),
    ]).then(([batch, cBDetail, crBars]): any => {
      this.productData.batchs = batch;
      this.productData.cBDetail = cBDetail;
      this.productData.crBars = crBars;
    }).catch((error) => {
      console.log(error)
      this.presentToast(error.error.error, 'danger')
    }).finally(() => {
      this.hideLoading()
    });

    if (this.productData.Detail.QryGroup45 == "Y") {
      this.codebarDescription = this.productData.cBDetail.filter(x => x.OriginLocation != null)
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

    console.log(this.productData)
  }



  submit() {
    this.productData.cajasEscaneadas = this.cantidadEscaneada
    this.productData.pesoContado = this.cantidadPeso

    if (this.productData.count != 0 && this.cantidadEscaneada <= 0) {
      this.productData.count = this.cantidadEscaneada
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/recepcion-sap'])
    } else if (this.cantidadEscaneada <= 0) {
      this.presentToast('Debe igresar una cantidad valida', 'warning')
    } else if (this.productData.Detail.QryGroup41 == 'Y') {
      this.productData.count = this.cantidadEscaneada
      this.productData.detalle = this.detail
      this.productData.crBars = this.crBars
      this.productData.SupplierCode = this.productData.Detail.SuppCatNum;
      this.receptionService.setReceptionData(this.productData)
      this.router.navigate(['/members/recepcion-sap'])
    } else {

      this.productData.count = this.detail.map(lote => lote.quantity).reduce((a, b) => a + b, 0)

      let validPercent = (Number(this.porcentaje) / 100) * Number(this.productData.OpenInvQty)
      let validQuantity = Number(validPercent) + Number(this.productData.OpenInvQty)

      if (this.productData.count > Number(validQuantity)) {
        this.presentToast('Cantidad Excede a la cantidad solicitada', 'warning')
      } else {
        this.productData.detalle = this.detail
        this.productData.crBars = this.crBars
        this.productData.SupplierCode = this.productData.Detail.SuppCatNum;
        this.receptionService.setReceptionData(this.productData)
        this.router.navigate(['/members/recepcion-sap'])
      }
    }

  }

  eliminar(index) {
    this.cantidadEscaneada--
    this.cantidadPeso = this.cantidadPeso - Number(this.detail[index].quantity)
    this.detail.splice(index, 1)

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
            console.log(data)
            this.selectedDesc = data
          }
        }
      ]
    });

    await alert.present();
  }

  async promtNewCr() {
    console.log(this.productData)

    if (this.productData.UomEntry == 196) {
      this.productData.UomPlaceHolder = 'KG';
    } else {
      this.productData.UomPlaceHolder = this.productData.UomCode;
    }
    const alert = await this.alert.create({
      header: 'CB Reemplazo',
      inputs: [
        {
          type: 'date',

          placeholder: 'Fecha de Caducidad'
        },
        {
          type: 'date',
          placeholder: 'Fecha de Produccion'
        },
        {
          placeholder: 'Codigo de Barra'
        },
        {
          type: 'number',
          placeholder: `Cantidad ${this.productData.UomPlaceHolder}`
        }
      ],
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

            console.log(data)

            let isScanned = this.detail.findIndex(prod => prod.code == data[0]);

            if (isScanned >= 0) {
              this.presentToast("CR Ya Fue Agregado", "warning");
              return
            }

            let pedimento;

            if (this.navExtras.getPedimento() == undefined && this.productData.QryGroup2 == 'Y') {
              this.presentToast("Debes Agregar Un Pedimento", "warning")
              this.peso = 0;
              document.getElementById('input-codigo').setAttribute('value', '');
              document.getElementById('input-codigo').focus();
              return
            } else {
              pedimento = this.navExtras.getPedimento();
            }


            let output = {
              ItemCode: this.productData.ItemCode,
              FechaCaducidad: data[0],
              FechaProduccion: data[1],
              Peso: data[3],
              CodeBar: data[2]
            }

            this.crBars.push(output)
            this.detail.push({
              name: data[2].substr(data[2] - 36),
              code: data[2],
              attr1: this.lote,
              expirationDate: data[0],
              manufacturingDate: data[1],
              quantity: Number(data[3]),
              pedimento: (pedimento) ? '' : pedimento
            });

            this.cantidadEscaneada = this.detail.length;
            this.cantidadPeso = this.detail.map(x => x.quantity).reduce((a, b) => a + b, 0);
          }
        }
      ]
    });

    await alert.present();
  }

  public getDataFromGS1() {

    if (this.codigoBarra == '') return

    let pedimento

    if (this.navExtras.getPedimento() == undefined && this.productData.QryGroup2 == 'Y') {
      this.presentToast("Debes Agregar Un Pedimento", "warning")
      this.peso = 0;
      document.getElementById('input-codigo').setAttribute('value', '');
      document.getElementById('input-codigo').focus();
      return
    } else {
      pedimento = this.navExtras.getPedimento();
    }


    try {

      let answer = parseBarcode(this.codigoBarra);

      console.log(this.productData.Detail.SuppCatNum)
      console.log(answer)

      if (this.productData.Detail.SuppCatNum == null) {
        this.productData.Detail.SuppCatNum = answer.parsedCodeItems[0].data
        // this.getDataFromCodeBar();
        // return
      }

      if (this.productData.Detail.SuppCatNum != answer.parsedCodeItems[0].data) {
        this.presentToast("El codigo de manufactura no coincide con el codigo escaneado. Contactar Datos Maestros.", "warning");
        this.peso = 0;
        document.getElementById('input-codigo').setAttribute('value', '');
        document.getElementById('input-codigo').focus();
        return
      }

      let detailGS1 = {
        name: '',
        code: '',
        attr1: '',
        expirationDate: '',
        manufacturingDate: '',
        quantity: 0,
        pedimento: (pedimento) ? '' : pedimento
      };

      if (answer.parsedCodeItems[2].ai == '13' || answer.parsedCodeItems[2].ai == '11') {
        detailGS1.manufacturingDate = formatDate(answer.parsedCodeItems[2].data, 'yyyy-MM-dd', 'en-US');
        this.FechaProd = formatDate(answer.parsedCodeItems[2].data, 'yyyy-MM-dd', 'en-US');
      } else if (this.FechaProd == undefined) {
        this.presentToast("Ingresa fecha de produccion", "warning")
        document.getElementById('input-codigo').setAttribute('value', '');
        document.getElementById('input-codigo').focus();
        return
      } else if (this.FechaProd != undefined) {
        detailGS1.manufacturingDate = this.FechaProd.split('T')[0];
        this.FechaProd = formatDate(this.FechaProd.split('T')[0], 'yyyy-MM-dd', 'en-US');
      }

      if (answer.parsedCodeItems[2].ai == '12') {
        detailGS1.expirationDate = formatDate(answer.parsedCodeItems[2].data, 'yyyy-MM-dd', 'en-US');
        this.FechaCad = formatDate(answer.parsedCodeItems[2].data, 'yyyy-MM-dd', 'en-US');
      } else if (this.productData.Detail.U_IL_DiasCad != '0' && answer.parsedCodeItems[2].ai == '13' || answer.parsedCodeItems[2].ai == '11') {
        detailGS1.expirationDate = new Date(answer.parsedCodeItems[2].data.setDate(answer.parsedCodeItems[2].data.getDate() + Number(this.productData.Detail.U_IL_DiasCad))).toISOString()
        detailGS1.expirationDate = formatDate(detailGS1.expirationDate, 'yyyy-MM-dd', 'en-US');
        this.FechaCad = formatDate(answer.parsedCodeItems[2].data, 'yyyy-MM-dd', 'en-US');
      } else if(this.FechaCad == undefined){
        this.presentToast("Ingresa fecha de vencimiento", "warning")
        document.getElementById('input-codigo').setAttribute('value', '');
        document.getElementById('input-codigo').focus();
        return
      } else if(this.FechaCad != undefined){
        detailGS1.expirationDate = this.FechaCad.split('T')[0];
      }

      if (answer.parsedCodeItems[1].ai == '3201' || answer.parsedCodeItems[1].ai == '3202') {
        detailGS1.quantity = Number(Number(answer.parsedCodeItems[1].data / 2.2046).toFixed(2))
      } else {
        detailGS1.quantity = Number(Number(answer.parsedCodeItems[1].data).toFixed(2));
      }

      detailGS1.name = this.codigoBarra.substr(this.codigoBarra.length - 36);
      detailGS1.code = this.codigoBarra.trim();
      detailGS1.attr1 = this.lote;


      this.detail.push(
        detailGS1
      );

      console.log(this.detail)

      this.cantidadEscaneada = this.detail.length;
      this.cantidadPeso = this.detail.map(x => x.quantity).reduce((a, b) => a + b, 0);
      this.peso = 0;
      document.getElementById('input-codigo').setAttribute('value', '');
      document.getElementById('input-codigo').focus();
      this.presentToast("Se Escaneo Correctamente", "success");

    } catch (e) {
      console.log(e);
      this.getDataFromCodeBar();
    }
  }


  public getDataFromCodeBar(): void {

    if (this.codigoBarra == '') return


    let pedimento;

    if (this.navExtras.getPedimento() == undefined && this.productData.QryGroup2 == 'Y') {
      this.presentToast("Debes Agregar Un Pedimento", "warning")
      this.peso = 0;
      document.getElementById('input-codigo').setAttribute('value', '');
      document.getElementById('input-codigo').focus();
      return
    } else {
      pedimento = this.navExtras.getPedimento();
    }


    if (this.lote == undefined || this.lote == '') {
      this.presentToast('Debes ingresar lote primero', 'warning')
      return
    }

    if (this.codigoBarra.trim()[0] == 'C') {
      let isScanned = this.productData.crBars.findIndex((prod: any) => prod.CodeBar == this.codigoBarra.trim());
      if (isScanned >= 0) {
        this.presentToast("Este Codigo de Barra Ya Fue Registrado", "warning");
        this.peso = 0
        document.getElementById('input-codigo').setAttribute('value', '');
        document.getElementById('input-codigo').focus();
        return
      }
    }

    let codeBarSettings;

    if (this.productData.Detail.QryGroup45 == 'Y') {
      codeBarSettings = this.productData.cBDetail.findIndex((y: any) => y.OriginLocation == this.selectedDesc);
      console.log(codeBarSettings)
    } else {
      codeBarSettings = this.productData.cBDetail.findIndex((y: any) => y.BarcodeLength == this.codigoBarra.trim().length);
    }

    if (codeBarSettings < 0) {
      this.presentToast("El Codigo De Barra No Coincide Con la Configuracion Del Codigo De Barra Del Producto.", "warning");
      this.peso = 0;
      document.getElementById('input-codigo').setAttribute('value', '');
      document.getElementById('input-codigo').focus();
      return
    }



    let pesoDeEtiqueta = this.codigoBarra.substr(this.productData.cBDetail[codeBarSettings].WeightPosition - 1, this.productData.cBDetail[codeBarSettings].WeightLength);

    if (this.productData.cBDetail[codeBarSettings].HasDecimal.data[0] == 1 && this.productData.cBDetail[codeBarSettings].UoM == 4) {
      this.peso = Number((Number(pesoDeEtiqueta) / 2.2046).toFixed(2));
      console.log(this.peso)
    } else if (this.productData.cBDetail[codeBarSettings].HasDecimal.data[0] == 1 && this.productData.cBDetail[codeBarSettings].UoM == 3) {
      this.peso = Number(pesoDeEtiqueta);
    } else {
      this.peso = getCerosFromEtiquetaInventario(this.productData, pesoDeEtiqueta, codeBarSettings);
    }


    if (this.peso < this.productData.U_IL_PesMin || this.peso > this.productData.U_IL_PesMax) {
      this.presentToast("El Peso Escaneado No Esta Dentro De Los Parametros De Peso Maximo O Peso Minimo.", "warning");
      this.peso = 0
      document.getElementById('input-codigo').setAttribute('value', '');
      document.getElementById('input-codigo').focus();
      return
    }


    let isScanned = this.detail.findIndex(prod => prod.code == this.codigoBarra.trim());
    let availableBatch = this.productData.batchs.findIndex(prod => prod.U_IL_CodBar == this.codigoBarra.trim());


    if (isScanned >= 0 || availableBatch >= 0) {
      this.presentToast("Este Codigo de Barra Ya Fue Registrado", "warning");
      this.peso = 0
      document.getElementById('input-codigo').setAttribute('value', '');
      document.getElementById('input-codigo').focus();
      return
    }

    this.detail.push({
      name: this.codigoBarra.substr(this.codigoBarra.length - 36),
      code: this.codigoBarra.trim(),
      attr1: this.lote,
      expirationDate: this.FechaCad,
      quantity: this.peso,
      pedimento: (pedimento) ? '' : pedimento
    });


    this.cantidadEscaneada = this.detail.length;
    this.cantidadPeso = this.detail.map(x => x.quantity).reduce((a, b) => a + b, 0);
    this.peso = 0;
    document.getElementById('input-codigo').setAttribute('value', '');
    document.getElementById('input-codigo').focus();
    this.presentToast("Se Escaneo Correctamente", "success");


  }

  async imprimirTarima() {
    await this.presentLoading('Imprimiendo etiqueta...');

    this.http.get(`${environment.apiSAP}/api/Impresion/PruebaReciboTarima?Itemcode=${this.productData.ItemCode}&Total=${Number(this.cantidadPeso)}
    &UoM=${this.productData.UomEntry}&DocNum=${this.productData.DocNum}&Cajas=${Number(this.cantidadEscaneada)}&printer=${this.appSettings.IpImpresora}`).toPromise()
      .then(() => {
        this.presentToast("Se imprimio Correctamente", "success");
      }).catch((error) => {
        this.presentToast(error.error.error, 'danger')
      }).finally(() => {
        this.hideLoading()
      })


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
      // duration: 3000
    });

    await this.load.present()
  }

  hideLoading() {
    // console.log('loading')
    this.load.dismiss()
  }

}
