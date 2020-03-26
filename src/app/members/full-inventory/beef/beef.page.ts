import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SettingsService } from '../../../services/settings.service';
import { NavExtrasService } from '../../../services/nav-extras.service';
import { validateCodeBar, getCerosFromEtiqueta } from '../../commons';
import {
  Platform,
  ToastController,
  LoadingController,
  AlertController
}
  from '@ionic/angular';

const NAME = 'USER_NAME';

@Component({
  selector: 'app-beef',
  templateUrl: './beef.page.html',
  styleUrls: ['./beef.page.scss'],
})
export class BeefPage implements OnInit {

  public productInfo: any;
  public Filedata: any;
  public warehouseCode: string;
  public apiSAPURL: string;
  public codigoBarra: string;
  public codeBarDetails = [];
  public pesoDeEtiqueta: number;
  public cajasEscaneadas: number = 0;
  public lote: string;
  public location: string;
  public pesoEscaneado: number = 0;
  public load: any;
  public rows = [];

  constructor(private navExtras: NavExtrasService,
    private http: HttpClient,
    private router: Router,
    private platform: Platform,
    private loading: LoadingController,
    private alertController: AlertController,
    private settings: SettingsService,
    private toastController: ToastController,
    private storage: Storage) { }

  ngOnInit() {
    this.productInfo = this.navExtras.getInventoryProduct();

    if (this.platform.is("cordova")) {
      this.Filedata = this.settings.fileData
      this.warehouseCode = this.Filedata.sucursal
      this.apiSAPURL = this.Filedata.apiSAP
    } else {
      this.apiSAPURL = environment.apiSAP
      this.warehouseCode = "S01"
    }

  }

  public getDataFromEtiqueta(): void {
    if (this.codigoBarra == '') { } else {
      validateCodeBar(this.productInfo, environment.apiWMS, this.codigoBarra, this.http).then((value: boolean) => {
        if (!value) {
          let indCodeFoundInList = this.codeBarDetails.findIndex(product =>
            product.codebar == this.codigoBarra.trim())
          if (indCodeFoundInList < 0) {
            let codFound = this.productInfo.cBDetail.findIndex(y =>
              y.length == this.codigoBarra.trim().length)
            if (codFound < 0) {
              this.presentToast('El codigo de barra no coincide con' +
                'la informacion de etiqueta de proveedor.', 'warning')
            } else {

              let pesoDeEtiqueta = this.codigoBarra.substr(
                this.productInfo.cBDetail[codFound].peso_pos - 1,
                this.productInfo.cBDetail[codFound].peso_length)


              if (this.productInfo.cBDetail[codFound].maneja_decimal == 1) {
                if (this.productInfo.cBDetail[codFound].UOM_id != 3) {
                  this.pesoDeEtiqueta = Number((Number(pesoDeEtiqueta)
                    / 2.2046).toFixed(2));
                } else {
                  this.pesoDeEtiqueta = Number(pesoDeEtiqueta);
                }
              } else {
                this.pesoDeEtiqueta = getCerosFromEtiqueta(this.productInfo,
                  pesoDeEtiqueta,
                  codFound);
              }

              let scanned;

              scanned = {
                ItemCode: this.productInfo.detail.ItemCode,
                ItemName: this.productInfo.detail.ItemName,
                codebar: this.codigoBarra.trim(),
                Lote: this.lote,
                visual: this.codigoBarra
                  .substr(this.codigoBarra.length - 14).trim(),
                Quantity: this.pesoDeEtiqueta
              }

              this.cajasEscaneadas++;
              this.pesoEscaneado = Number((this.pesoEscaneado +
                this.pesoDeEtiqueta).toFixed(4));

              this.presentToast('Se agrego a la lista', 'success');
              this.codeBarDetails.push(scanned);


            }
          } else {
            this.presentToast('Codigo ya fue escaneado', 'warning');
          }
        } else {
          this.presentToast("El codigo ya existe. Intenta de nuevo", "warning")
        }
      });

    }

    document.getElementById('input-codigo').setAttribute('value', '');
  }

  async promptCloseProduct() {
    const alert = await this.alertController.create({
      header: 'Cerrar Producto',
      message: 'Si cierra el producto ya no podra seguir inventariandolo. Confirmar para continuar.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.closeProduct()
          }
        }
      ]
    });

    await alert.present();
  }

  async closeProduct() {

    await this.presentLoading('Cerrando Producto..')

    let data = {
      SAPheader: this.productInfo.headerId,
      ItemCode: this.productInfo.detail.ItemCode
    }

    this.http.post(environment.apiWMS + '/closeProduct', data)
      .toPromise().then((resp: any) => {
        if (resp.success) {
          this.presentToast('Se cerro correctamente', 'success')
          this.router.navigate(['/members/full-inventory'])
        }
      }).catch(err => {
        console.log(err)
        this.presentToast('Error al cerrar producto', 'danger')
      }).finally(() => {
        this.hideLoading()
      })
  }




  async saveInventory() {

    if (this.codeBarDetails.length != 0) {

      await this.presentLoading("Guardando...");

      const codeBars = this.codeBarDetails

      this.storage.get(NAME).then(userLogedIn => {

        this.rows.push({
          ItemCode: this.productInfo.detail.ItemCode,
          ItemName: this.productInfo.detail.ItemName,
          Location: this.productInfo.location,
          InvQuantity: this.pesoEscaneado,
          EmployeeName: userLogedIn
        })


        let datos = {
          SapHeaderId: this.productInfo.headerId,
          ItemCode: this.productInfo.detail.ItemCode,
          ItemName: this.productInfo.detail.ItemName,
          UOM: this.productInfo.uom[0].BASEUOM,
          ManejaLote: this.productInfo.detail.ManBtchNum,
          TipoPeso: this.productInfo.detail.U_IL_TipPes,
          rows: this.rows,
          codeBars
        }

        this.http.post(environment.apiWMS + '/saveOrUpdateInventoryRequestRow', datos)
          .toPromise()
          .then(() => {
            this.presentToast("Guardado Correctamente", "success")
            this.router.navigate(['members/full-inventory'])
          }).catch(() => {
            this.presentToast("Error al Guardar", "danger")
          }).finally(() => { this.hideLoading() });
      })
    } else {
      this.presentToast("No hay registros para enviar", "warning");
    }

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
