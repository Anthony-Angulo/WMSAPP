import { Component, OnInit } from '@angular/core';
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
  detail = []
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

    this.appSettings = getSettingsFileData(this.platform, this.settings);

 

    var date = new Date();
    date = new Date(date.setFullYear(date.getFullYear() + 1));
    this.FechaCad = date.toISOString();

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
    ]).then(([batch, cBDetail]): any => {
      this.productData.batchs = batch;
      this.productData.cBDetail = cBDetail;
    }).catch((error) => {
      console.log(error)
      this.presentToast(error.error.error, 'danger')
    }).finally(() => {
      this.hideLoading()
    })

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
